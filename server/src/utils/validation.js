import Joi from 'joi'

export const validationOptions = {
    allowUnknown: true,
    stripUnknown: true,
}

export const companyDataValidation = {
    name: Joi.string(),
    description: Joi.string(),
    phoneNumber: Joi.string(),
    email: Joi.string().email(),
    addressLine1: Joi.string(),
    addressLine2: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    // longitude, latitude
    addressCoords: Joi.array().items(Joi.number()).length(2),
    businessHours: Joi.array()
        .items(
            Joi.object({
                // number of minutes since the day started
                startsAt: Joi.number()
                    .integer()
                    .min(0)
                    .max(24 * 60)
                    .required(),
                endsAt: Joi.number()
                    .integer()
                    .min(Joi.ref('startsAt'))
                    .max(24 * 60)
                    .required(),
            })
        )
        .length(7),
}
