import { dirResolver } from 'vite-auto-import-resolvers'
import type { Resolver } from 'unplugin-auto-import/types'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

type Arrayable<T> = T | Array<T>
type Resolvers = Arrayable<Arrayable<Resolver>>

export const AutoImportResolvers: Resolvers = [NaiveUiResolver()]

AutoImportResolvers.push(
    dirResolver({ prefix: 'use' }),
    dirResolver({
        target: 'stores',
        suffix: 'Store'
    })
)
