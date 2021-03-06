import { store } from '@/store'
import { setSession } from '@/store/session'
import { api } from '@/utils/api'
import { genAccountData } from 'Common'

export const registerUser = async userInfo => {
    const { data } = await api.post(
        '/accounts/register',
        userInfo || genAccountData()
    )
    store.dispatch(setSession(data.session))
}
