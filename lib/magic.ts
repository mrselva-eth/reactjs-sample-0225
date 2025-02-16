import type { Magic as MagicBase } from "magic-sdk"
import type { SDKBase, InstanceWithExtensions, Extension } from "@magic-sdk/provider"

export type Magic = InstanceWithExtensions<SDKBase, Extension<string>[]> & MagicBase

const createMagic = (key: string): Magic | null => {
  if (typeof window !== "undefined") {
    const { Magic } = require("magic-sdk")
    const { OTPStrategy } = require("@magic-ext/auth")
    return new Magic(key, {
      extensions: [new OTPStrategy()],
      network: {
        rpcUrl: "https://rpc-mainnet.maticvigil.com/",
        chainId: 137,
      },
    }) as Magic
  }
  return null
}

export const magic = createMagic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)

