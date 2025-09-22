import React from 'react'
import Terminal from '@/components/Terminal/Terminal'
import TerminalGuard from '@/components/Terminal/TerminalGuard'
import Box from '@/commom/layout/Box'

const SystemTerminal: React.FC = () => {
  return (
    <Box>
      <TerminalGuard>
        <Terminal className="h-full" />
      </TerminalGuard>
    </Box>
  )
}

export default SystemTerminal
