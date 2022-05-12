import Fastify from 'fastify'
import errorHandler from '../utils/errorHandler.js'
import { validationOptions } from '../utils/validation.js'
import { createWriteStream, unlinkSync } from 'fs'
import uid from 'uid-safe'
import AppError from '../utils/AppError.js'
import { resolve } from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'
const pump = promisify(pipeline)

export default async () => {
    const fastify = Fastify({
        ignoreTrailingSlash: true,
        logger: false,
        disableRequestLogging: true,
    })

    fastify.decorateRequest('account', null)
    fastify.decorateRequest('company', null)

    const onFile = async part => {
        const filenameParts = part.filename.split('.')
        const fileExt = filenameParts[filenameParts.length - 1]
        const fileNameOnDisk = (await uid(16)) + '.' + fileExt
        const filePathOnDisk = resolve(
            process.env.UPLOADS_FOLDER,
            fileNameOnDisk
        )

        await pump(part.file, createWriteStream(filePathOnDisk))
        part.fileNameOnDisk = fileNameOnDisk
        part.filePathOnDisk = filePathOnDisk
    }

    fastify.register(import('@fastify/multipart'), {
        attachFieldsToBody: true,
        onFile,
    })

    fastify
        .register(import('../components/accounts/routes.js'), {
            prefix: 'accounts',
        })
        .register(import('../components/companies/routes.js'), {
            prefix: 'companies',
        })

    fastify.setValidatorCompiler(({ schema }) => {
        return data => {
            const { value, error } = schema.validate(data, validationOptions)
            if (error)
                return {
                    error: new AppError({
                        httpCode: 400,
                        name: 'validation-error',
                        description: error,
                    }),
                }

            return { value }
        }
    })

    const deleteSavedFiles = body => {
        for (const key in body) {
            if (Array.isArray(body[key])) {
                for (const item of body[key]) {
                    if (!item.filePathOnDisk) continue
                    unlinkSync(item.filePathOnDisk)
                }
            } else {
                unlinkSync(body[key].filePathOnDisk)
            }
        }
    }

    fastify.setErrorHandler(async (error, req, reply) => {
        if (req.isMultipart()) {
            deleteSavedFiles(req.body)
        }

        await errorHandler.handleError(error, reply)
    })

    return fastify
}
