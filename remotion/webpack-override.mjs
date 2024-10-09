import { enableTailwind } from '@remotion/tailwind'

/**
 *  @param {import('webpack').Configuration} currentConfiguration
 */
export const webpackOverride = (currentConfiguration) => {
  return enableTailwind(currentConfiguration)
}
