import { Button } from '@heroui/react'
import React from 'react'
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function ErrorMessage({error , refetch}) {
  const { themeColors } = useTheme();

  return (
    <div className='flex flex-col gap-3 justify-center items-center'>
        <h1 
          className='text-3xl'
          style={{ color: themeColors.primary }}
        >
          {error.message}
        </h1>
        <Button 
          onPress={refetch}
          style={{ 
            backgroundColor: themeColors.primary,
            color: "white"
          }}
        >
          Retry
        </Button>
    </div>
  )
}
