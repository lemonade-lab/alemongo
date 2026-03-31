import React, { useCallback, Fragment } from 'react'
import MarkdownJS from 'markdown-to-jsx'
import classNames from 'classnames'
import { Image } from 'antd'

type MyTitleProps = {
  children: React.ReactNode
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
}

type MarkdownAnchorProps = {
  href?: string
  title?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLSpanElement>

type MarkdownHeadingProps = {
  children?: React.ReactNode
}

type MarkdownPreProps = {
  children?: React.ReactNode
}

export type PropsOnInput = (params: {
  command: string
  reply: boolean
  enter: boolean
}) => void

export type Props = {
  content: string
  className?: string
  onInput?: PropsOnInput
  onMention?: (username: string) => void
  userMap?: Map<number, string>
  channelMap?: Map<number, string>
}

function Markdown({ content, className }: Props) {
  const handleLinkClick = useCallback(
    (event: React.MouseEvent, url: string) => {
      event.preventDefault()

      if (url.startsWith('#')) {
        return
      }

      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }
    },
    []
  )

  const MyTitle = useCallback(
    ({ children, type, className = '' }: MyTitleProps) => (
      <div
        className={classNames(
          'flex-1 w-full text-slate-600 dark:text-slate-200',
          {
            'text-lg': type === 'h3',
            'text-xl': type === 'h2',
            'text-2xl': type === 'h1',
            'text-base': type === 'h4',
            'text-sm': type === 'h5',
            'text-xs': type === 'h6',
            'font-bold': type === 'h1' || type === 'h2' || type === 'h3',
            'font-semibold': type === 'h4' || type === 'h5' || type === 'h6'
          },
          className
        )}
      >
        {children}
      </div>
    ),
    []
  )

  return (
    <div
      className={classNames(
        className,
        `
        p-1 rounded-md
        [&_img]:m-0
        [&_img]:max-w-full
        [&_img]:xs:max-w-[14rem]
        [&_img]:sm:max-w-[16rem]
        [&_img]:xl:max-w-[18rem]
        [&_img]:h-auto
        `
      )}
    >
      <MarkdownJS
        options={{
          overrides: {
            img: {
              component: Image
            },

            p: {
              // 转为 div，避免嵌套p标签问题
              component: ({ children, ...props }) => (
                <div {...props}>{children}</div>
              )
            },
            a: {
              component: useCallback(
                ({ href, title, children, ...props }: MarkdownAnchorProps) => (
                  <span
                    {...props}
                    title={title}
                    onClick={e => href && handleLinkClick(e, href)}
                    className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
                  >
                    {children}
                  </span>
                ),
                [handleLinkClick]
              )
            },
            h1: useCallback(
              ({ children }: MarkdownHeadingProps) => <MyTitle type="h1">{children}</MyTitle>,
              [MyTitle]
            ),
            h2: useCallback(
              ({ children }: MarkdownHeadingProps) => <MyTitle type="h2">{children}</MyTitle>,
              [MyTitle]
            ),
            h3: useCallback(
              ({ children }: MarkdownHeadingProps) => <MyTitle type="h3">{children}</MyTitle>,
              [MyTitle]
            ),
            h4: useCallback(
              ({ children }: MarkdownHeadingProps) => <MyTitle type="h4">{children}</MyTitle>,
              [MyTitle]
            ),
            h5: useCallback(
              ({ children }: MarkdownHeadingProps) => <MyTitle type="h5">{children}</MyTitle>,
              [MyTitle]
            ),
            h6: useCallback(
              ({ children }: MarkdownHeadingProps) => <MyTitle type="h6">{children}</MyTitle>,
              [MyTitle]
            ),
            pre: useCallback(
              ({ children }: MarkdownPreProps) => (
                <pre className="px-2 py-1 bg-slate-500 dark:bg-slate-600 rounded-md text-white">
                  {children}
                </pre>
              ),
              []
            )
          },
          forceBlock: false,
          forceInline: false,
          wrapper: Fragment
        }}
      >
        {content}
      </MarkdownJS>
    </div>
  )
}

export default Markdown
