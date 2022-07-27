import Prism from 'markdown-it-prism'
import Markdown from 'vite-plugin-md'
import { viteEnv } from '../shared/env'

export const markdownWrapperClasses = viteEnv.VITE_APP_MARKDOWN
    ? 'prose md:prose-lg lg:prose-lg dark:prose-invert text-left p-10 prose-slate prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600'
    : ''

export default () => {
    return (
        viteEnv.VITE_APP_MARKDOWN &&
        Markdown({
            wrapperClasses: markdownWrapperClasses,
            markdownItSetup(md) {
                md.use(Prism)
            }
        })
    )
}
