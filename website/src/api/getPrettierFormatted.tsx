import axios from 'axios'
import {getApiEndpoint} from 'api/config'

const getPrettierFormatted = (unformattedSource: string) =>
  axios.post<{
    formatted: string
    ast: any
    doc: any
  }>(getApiEndpoint('/prettier-format'), {
    unformattedSource,
  })

export default getPrettierFormatted
