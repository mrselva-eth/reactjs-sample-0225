"use client"

export function EnvScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.ENV = {
            NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: "${process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY}"
          }
        `,
      }}
    />
  )
}

