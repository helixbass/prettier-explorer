import {InterpolationWithTheme} from '@emotion/core'

type StylesObject = {
  [className: string]: InterpolationWithTheme<any>
}

export const makeStyles = <TStyles extends StylesObject>(styles: TStyles) =>
  styles
