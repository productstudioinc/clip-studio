import React from 'react'
import { TextMessageVideoProps } from '@/stores/templatestore'
import { ChevronLeft, ChevronRight, Phone, Video } from 'lucide-react'

import { cn } from '../lib/utils'

const iMessageTheme = {
  light: {
    background: '#FFFFFF',
    header: '#F1F1F2',
    text: '#000000',
    avatar: '#D3D3D3',
    blue: '#007AFF',
    userBubble: '#007AFF',
    otherBubble: '#E9E9EB'
  },
  dark: {
    background: '#000000',
    header: '#1C1C21',
    text: '#FFFFFF',
    avatar: '#808080',
    blue: '#007AFF',
    userBubble: '#007AFF',
    otherBubble: '#26252A'
  }
}

const whatsAppTheme = {
  light: {
    background: '#E5DDD5',
    header: '#F6F6F6',
    text: '#000000',
    avatar: '#DFE5E7',
    blue: '#007AFF',
    userBubble: '#DCF8C7',
    otherBubble: '#F9F9F9'
  },
  dark: {
    background: '#0B141A',
    header: '#171717',
    text: '#FFFFFF',
    avatar: '#6B7C85',
    blue: '#007AFF',
    userBubble: '#056162',
    otherBubble: '#3C3C3E'
  }
}

const MessageBubble: React.FC<{
  message: TextMessageVideoProps['messages'][number]
  mode: TextMessageVideoProps['mode']
  style: TextMessageVideoProps['style']
}> = ({ message, mode, style }) => {
  const isDarkMode = mode === 'dark'
  const isUser = message.sender === 'sender'
  const currentTheme =
    style === 'imessage'
      ? isDarkMode
        ? iMessageTheme.dark
        : iMessageTheme.light
      : isDarkMode
        ? whatsAppTheme.dark
        : whatsAppTheme.light

  const bubbleColor = isUser
    ? currentTheme.userBubble
    : currentTheme.otherBubble
  const textColor =
    style === 'imessage'
      ? isUser
        ? '#FFFFFF'
        : currentTheme.text
      : currentTheme.text

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {((message.content.type === 'text' && message.content.value) ||
        (message.content.type === 'image' &&
          message.content.value &&
          typeof message.content.value === 'object' &&
          'url' in message.content.value)) && (
        <div className="relative max-w-sm">
          <div
            className={`rounded-[24px] py-3 px-5 relative z-10 text-lg`}
            style={{ backgroundColor: bubbleColor, color: textColor }}
          >
            {message.content.type === 'text' &&
              typeof message.content.value === 'string' &&
              message.content.value}
            {message.content.type === 'image' &&
              typeof message.content.value === 'object' &&
              'url' in message.content.value && (
                <img
                  src={message.content.value.url}
                  alt="Image"
                  className="rounded-lg"
                />
              )}
          </div>
          <svg
            className={`absolute bottom-px ${isUser ? '-right-4 transform scale-x-[-1]' : '-left-4'} h-14 w-14 z-0`}
            width="30"
            height="60"
            viewBox="0 0 30 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.6315 43.9398C10.3974 42.7269 10.2748 41.4743 10.2748 40.1931V31.4011H29.9274V59.8457C25.1684 59.8457 20.8045 58.1542 17.4041 55.3395C14.0117 57.5995 8.57202 59.7477 2 58.5528C3.81011 57.777 10.792 53.1225 10.5334 43.8133C10.5648 43.8565 10.5975 43.8986 10.6315 43.9398Z"
              fill={bubbleColor}
            />
            <path
              d="M10.6315 43.9398L10.3209 44.1965L11.0271 43.8635L10.6315 43.9398ZM10.2748 31.4011V30.9982H9.87186V31.4011H10.2748ZM29.9274 31.4011H30.3303V30.9982H29.9274V31.4011H29.9274ZM29.9274 59.8457V60.2487H30.3303V59.8457H29.9274ZM17.4041 55.3395L17.661 55.0291L17.4301 54.838L17.1807 55.0041L17.4041 55.3395ZM2 58.5528L1.84128 58.1825L0.610885 58.7098L1.92792 58.9492L2 58.5528ZM10.5334 43.8133L10.8592 43.5763L10.0945 42.5248L10.1306 43.8245L10.5334 43.8133ZM9.87186 40.1931C9.87186 41.5001 9.99694 42.7783 10.2359 44.0162L11.0271 43.8635C10.7979 42.6756 10.6777 41.4486 10.6777 40.1931H9.87186ZM9.87186 31.4011V40.1931H10.6777V31.4011H9.87186ZM29.9274 30.9982H10.2748V31.8041H29.9274V30.9982ZM30.3303 59.8457V31.4011H29.5245V59.8457H30.3303ZM17.1471 55.6499C20.6171 58.5221 25.0712 60.2487 29.9274 60.2487V59.4428C25.2656 59.4428 20.9918 57.7862 17.661 55.0291L17.1471 55.6499ZM1.92792 58.9492C8.62829 60.1675 14.1727 57.9764 17.6275 55.6748L17.1807 55.0041C13.8507 57.2226 8.51576 59.328 2.07208 58.1564L1.92792 58.9492ZM10.1306 43.8245C10.2568 48.3679 8.61843 51.7681 6.72782 54.1314C4.8293 56.5045 2.68461 57.821 1.84128 58.1825L2.15872 58.9232C3.1255 58.5088 5.3768 57.1101 7.35708 54.6348C9.34528 52.1495 11.0685 48.5679 10.9361 43.8021L10.1306 43.8245ZM10.9421 43.6832C10.9133 43.6483 10.8857 43.6127 10.8592 43.5763L10.2075 44.0503C10.2439 44.1003 10.2817 44.149 10.3209 44.1965L10.9421 43.6832Z"
              fill={bubbleColor}
            />
          </svg>
        </div>
      )}
    </div>
  )
}

function IMessage({
  mode,
  receiver,
  messages,
  className
}: TextMessageVideoProps & { className?: string }) {
  const isDarkMode = mode === 'dark'
  const currentTheme = isDarkMode ? iMessageTheme.dark : iMessageTheme.light

  return (
    <div
      className={cn('w-full mx-auto h-fit flex flex-col rounded-xl', className)}
      style={{ backgroundColor: currentTheme.background }}
    >
      <header
        className={cn(
          'p-5 pb-3 flex items-center flex-col w-full rounded-t-xl'
        )}
        style={{ backgroundColor: currentTheme.header }}
      >
        <div className="flex items-center w-full justify-between">
          <ChevronLeft
            style={{ color: currentTheme.blue }}
            className="w-10 h-10"
          />
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div
                className={cn(
                  'rounded-full p-1 w-16 h-16 text-2xl font-light flex items-center justify-center'
                )}
                style={{
                  backgroundColor: currentTheme.avatar,
                  color: currentTheme.text
                }}
              >
                {receiver.image ? (
                  <img
                    src={receiver.image}
                    alt="Receiver"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span style={{ color: currentTheme.text }}>
                    {receiver.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Video
            style={{ color: currentTheme.blue }}
            className="w-10 h-10 stroke-[1.5]"
          />
        </div>
        <div
          className="mt-2 font-light text-base flex items-center"
          style={{ color: currentTheme.text }}
        >
          {receiver.name}{' '}
          <ChevronRight className="w-5 h-5 stroke-px text-[#808080]" />
        </div>
      </header>

      <div
        className="flex-grow overflow-y-auto p-5"
        role="log"
        aria-label="Message history"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            mode={mode}
            style="imessage"
          />
        ))}
      </div>
    </div>
  )
}

function WhatsAppMessage({
  mode,
  receiver,
  messages,
  className
}: TextMessageVideoProps & { className?: string }) {
  const isDarkMode = mode === 'dark'
  const currentTheme = isDarkMode ? whatsAppTheme.dark : whatsAppTheme.light

  return (
    <div
      className={cn('w-full mx-auto h-fit flex flex-col rounded-xl', className)}
      style={{ backgroundColor: currentTheme.background }}
    >
      <header
        className={cn('p-5 flex items-center w-full rounded-t-xl')}
        style={{ backgroundColor: currentTheme.header }}
      >
        <ChevronLeft
          style={{ color: currentTheme.blue }}
          className="w-8 h-8 mr-3"
        />
        <div
          className={cn(
            'rounded-full w-14 h-14 text-lg font-light flex items-center justify-center mr-3'
          )}
          style={{
            backgroundColor: currentTheme.avatar,
            color: currentTheme.text
          }}
        >
          {receiver.image ? (
            <img
              src={receiver.image}
              alt="Receiver"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span style={{ color: currentTheme.text }}>
              {receiver.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-grow">
          <div
            className="font-semibold text-lg"
            style={{ color: currentTheme.text }}
          >
            {receiver.name}
          </div>
          <div className="text-sm text-[#898989]">online</div>
        </div>
        <Video style={{ color: currentTheme.blue }} className="w-8 h-8 ml-5" />
        <Phone
          style={{ color: currentTheme.blue }}
          className="w-8 h-8 ml-5 mr-2"
        />
      </header>

      <div
        className="flex-grow overflow-y-auto p-5"
        role="log"
        aria-label="Message history"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            mode={mode}
            style="whatsapp"
          />
        ))}
      </div>
    </div>
  )
}

export function TextMessage({
  className,
  ...props
}: TextMessageVideoProps & { className?: string }) {
  switch (props.style) {
    case 'imessage':
      return <IMessage className={className} {...props} />
    case 'whatsapp':
      return <WhatsAppMessage className={className} {...props} />
    default:
      return null
  }
}
