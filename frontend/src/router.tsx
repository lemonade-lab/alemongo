import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { WithSuspense } from './WithSuspense'

const Home = lazy(() => import('./pages/home/App'))
const Login = lazy(() => import('./pages/login/App'))
const Panel = lazy(() => import('./pages/home/panel/App'))
const Main = lazy(() => import('./pages/Main'))
const Bots = lazy(() => import('./pages/home/Bots/App'))
const ButtonTemplate = lazy(
  () => import('./pages/home/Apps/QQBotButtonTemplate/App')
)
const Logs = lazy(() => import('./pages/home/panel/LogsOnline/App'))
const OneBot = lazy(() => import('./pages/home/Apps/OneBot/App'))
const Settings = lazy(() => import('./pages/home/Settings/App'))
const Package = lazy(() => import('./pages/home/panel/package/App'))
const Config = lazy(() => import('./pages/home/panel/Conifg/App'))
const XtermDate = lazy(() => import('./pages/home/panel/LogsControl/App'))
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
const AppsGit = lazy(() => import('./pages/home/Apps/Git/App'))
const AppsFirewall = lazy(() => import('./pages/home/Apps/Firewall/App'))
const AppsManage = lazy(() => import('./pages/home/Apps/Manage/App'))
const TasksPage = lazy(() => import('./pages/home/Tasks/App'))
const GitPackage = lazy(() => import('./pages/home/panel/packages/package/App'))
const GitManager = lazy(() => import('./pages/home/panel/packages/git/App'))
const Env = lazy(() => import('./pages/home/panel/env/App'))
const SystemTerminal = lazy(() => import('./pages/SystemTerminal/App'))
const PortMonitor = lazy(() => import('./pages/home/PortMonitor/App'))
const About = lazy(() => import('./pages/home/About/App'))
const SystemLogs = lazy(() => import('./pages/home/SystemLogs/App'))
const SFTP = lazy(() => import('./pages/home/SFTP/App'))
const Pipeline = lazy(() => import('./pages/home/Pipeline/App'))
const PipelineCreate = lazy(() => import('./pages/home/Pipeline/Create'))
const PipelineDetail = lazy(() => import('./pages/home/Pipeline/Detail'))
const PipelineExecution = lazy(() => import('./pages/home/Pipeline/Execution'))
const MultiBots = lazy(() => import('./pages/home/MultiBots/App'))

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
            path: 'apps/manage',
            element: (
              <WithSuspense>
                <AppsManage />
              </WithSuspense>
            )
          },
          {
            path: 'apps/git',
            element: (
              <WithSuspense>
                <AppsGit />
              </WithSuspense>
            )
          },
          {
            path: 'apps/firewall',
            element: (
              <WithSuspense>
                <AppsFirewall />
              </WithSuspense>
            )
          },
          {
            path: 'tasks',
            element: (
              <WithSuspense>
                <TasksPage />
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
            path: 'multibots',
            element: (
              <WithSuspense>
                <MultiBots />
              </WithSuspense>
            )
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
          },
          {
            path: 'system-terminal',
            element: (
              <WithSuspense>
                <SystemTerminal />
              </WithSuspense>
            )
          },
          {
            path: 'port-monitor',
            element: (
              <WithSuspense>
                <PortMonitor />
              </WithSuspense>
            )
          },
          {
            path: 'system-logs',
            element: (
              <WithSuspense>
                <SystemLogs />
              </WithSuspense>
            )
          },
          {
            path: 'sftp',
            element: (
              <WithSuspense>
                <SFTP />
              </WithSuspense>
            )
          },
          {
            path: 'about',
            element: (
              <WithSuspense>
                <About />
              </WithSuspense>
            )
          },
          {
            path: 'pipeline',
            element: (
              <WithSuspense>
                <Pipeline />
              </WithSuspense>
            )
          },
          {
            path: 'pipeline/create',
            element: (
              <WithSuspense>
                <PipelineCreate />
              </WithSuspense>
            )
          },
          {
            path: 'pipeline/:id',
            element: (
              <WithSuspense>
                <PipelineDetail />
              </WithSuspense>
            )
          },
          {
            path: 'pipeline/:id/edit',
            element: (
              <WithSuspense>
                <PipelineCreate />
              </WithSuspense>
            )
          },
          {
            path: 'pipeline/:pipelineId/execution/:id',
            element: (
              <WithSuspense>
                <PipelineExecution />
              </WithSuspense>
            )
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])
export default router
