declare module "react-google-recaptcha" {
  import * as React from "react"

  export interface ReCAPTCHAProps {
    sitekey: string
    onChange?: (token: string | null) => void
    grecaptcha?: any
    theme?: "light" | "dark"
    size?: "normal" | "compact" | "invisible"
    tabindex?: number
    stoken?: string
    hl?: string
    type?: "image" | "audio"
    badge?: "bottomright" | "bottomleft" | "inline"
    [key: string]: any
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    reset(): void
    execute(): Promise<string>
    executeAsync(): Promise<string>
    getResponse(): string | null
  }
}

