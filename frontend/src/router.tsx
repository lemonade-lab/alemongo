import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { WithSuspense } from './WithSuspense'

const Home = lazy(() => import('./pages/home/App'))
const NotRoute = lazy(() => import('./pages/404'))
const Login = lazy(() => import('./pages/login/App'))
const Panel = lazy(() => import('./pages/home/panel/App'))
const Main = lazy(() => import('./pages/Main'))
const Bots = lazy(() => import('./pages/home/Bots/App'))
const ButtonTemplate = lazy(
  () => import('./pages/home/Apps/QQBotButtonTemplate/App')
)
const Logs = lazy(() => import('./pages/home/panel/Logs'))
const OneBot = lazy(() => import('./pages/home/Apps/OneBot/App'))
const Settings = lazy(() => import('./pages/home/Settings/App'))
const Package = lazy(() => import('./pages/home/panel/package/App'))
const Config = lazy(() => import('./pages/home/panel/Conifg/App'))
const XtermDate = lazy(() => import('./pages/home/panel/xterm-date/App'))
const Response = lazy(() => import('./pages/home/panel/response/App'))
const Packages = lazy(() => import('./pages/home/panel/packages/App'))
const Account = lazy(() => import('./pages/home/Account/App'))
const Profile = lazy(() => import('./pages/home/Profile/App'))
const ConfigEdit = lazy(() => import('./pages/home/configs/create/App'))
const Configs = lazy(() => import('./pages/home/configs/App'))
const SSH = lazy(() => import('./pages/home/GitSSH/App'))
const SSHUpdate = lazy(() => import('./pages/home/GitSSH/Update'))
const PackagesMessage = lazy(
  () => import('./pages/home/panel/packages/message/App')
)
const Apps = lazy(() => import('./pages/home/Apps/App'))
const AppsNodeJS = lazy(() => import('./pages/home/Apps/NodeJS/App'))
const GitPackage = lazy(() => import('./pages/home/panel/packages/package/App'))
const GitManager = lazy(() => import('./pages/home/panel/packages/git/App'))
const Env = lazy(() => import('./pages/home/panel/env/App'))

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <WithSuspense>
        <Login />
      </WithSuspense>
    )
  },
  {
    path: '/',
    element: (
      <WithSuspense>
        <Main />
      </WithSuspense>
    ),
    children: [
      {
        path: '/',
        element: (
          <WithSuspense>
            <Home />
          </WithSuspense>
        ),
        children: [
          {
            path: '/',
            element: (
              <WithSuspense>
                <Apps />
              </WithSuspense>
            )
          },
          {
            path: 'apps/qqbot-button-template',
            element: (
              <WithSuspense>
                <ButtonTemplate />
              </WithSuspense>
            )
          },
          {
            path: 'apps/onebot',
            element: (
              <WithSuspense>
                <OneBot />
              </WithSuspense>
            )
          },
          {
            path: 'apps/nodejs',
            element: (
              <WithSuspense>
                <AppsNodeJS />
              </WithSuspense>
            )
          },
          {
            path: 'bots',
            element: (
              <WithSuspense>
                <Bots />
              </WithSuspense>
            ),
            children: []
          },
          {
            path: 'bots/:name',
            element: (
              <WithSuspense>
                <Panel />
              </WithSuspense>
            ),
            children: [
              {
                path: '',
                element: (
                  <WithSuspense>
                    <Config />
                  </WithSuspense>
                )
              },
              {
                path: 'config',
                element: (
                  <WithSuspense>
                    <Config />
                  </WithSuspense>
                )
              },
              {
                path: 'logs',
                element: (
                  <WithSuspense>
                    <Logs />
                  </WithSuspense>
                )
              },
              {
                path: 'package',
                element: (
                  <WithSuspense>
                    <Package />
                  </WithSuspense>
                )
              },
              {
                path: 'xterm-date',
                element: (
                  <WithSuspense>
                    <XtermDate />
                  </WithSuspense>
                )
              },
              {
                path: 'response',
                element: (
                  <WithSuspense>
                    <Response />
                  </WithSuspense>
                )
              },
              {
                path: 'packages',
                element: (
                  <WithSuspense>
                    <Packages />
                  </WithSuspense>
                )
              },
              {
                path: 'env',
                element: (
                  <WithSuspense>
                    <Env />
                  </WithSuspense>
                )
              },
              {
                path: 'packages/:name',
                element: (
                  <WithSuspense>
                    <PackagesMessage />
                  </WithSuspense>
                )
              },
              {
                path: 'packages/:name/package',
                element: (
                  <WithSuspense>
                    <GitPackage />
                  </WithSuspense>
                )
              },
              {
                path: 'packages/:name/git',
                element: (
                  <WithSuspense>
                    <GitManager />
                  </WithSuspense>
                )
              }
            ]
          },
          {
            path: 'settings',
            element: (
              <WithSuspense>
                <Settings />
              </WithSuspense>
            )
          },
          {
            path: 'account',
            element: (
              <WithSuspense>
                <Account />
              </WithSuspense>
            )
          },
          {
            path: 'profile',
            element: (
              <WithSuspense>
                <Profile />
              </WithSuspense>
            )
          },
          {
            path: 'ssh',
            element: (
              <WithSuspense>
                <SSH />
              </WithSuspense>
            )
          },
          {
            path: 'ssh/:name',
            element: (
              <WithSuspense>
                <SSHUpdate />
              </WithSuspense>
            )
          },
          {
            path: 'ssh/:name/update',
            element: (
              <WithSuspense>
                <SSHUpdate />
              </WithSuspense>
            )
          },
          {
            path: 'configs',
            element: (
              <WithSuspense>
                <Configs />
              </WithSuspense>
            )
          },
          {
            path: 'configs/:name',
            element: (
              <WithSuspense>
                <ConfigEdit />
              </WithSuspense>
            )
          },
          {
            path: 'configs/:name/create',
            element: (
              <WithSuspense>
                <ConfigEdit />
              </WithSuspense>
            )
          }
        ]
      },
      {
        path: '*',
        element: (
          <WithSuspense>
            <NotRoute />
          </WithSuspense>
        )
      }
    ]
  }
])
export default router
