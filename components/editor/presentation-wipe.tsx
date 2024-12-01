import React, { useMemo } from 'react'
import {
  TransitionPresentation,
  TransitionPresentationComponentProps
} from '@remotion/transitions'
import { AbsoluteFill, Easing, interpolate } from 'remotion'

export type SpeedRampProps = {
  maxSpeed?: number
}

type SlideDirection = 'from-left' | 'from-top' | 'from-right' | 'from-bottom'

const SpeedRampPresentation: React.FC<
  TransitionPresentationComponentProps<SpeedRampProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps
}) => {
  const progress = useMemo(() => {
    if (presentationDirection === 'exiting') {
      return 1 - presentationProgress
    }
    return presentationProgress
  }, [presentationDirection, presentationProgress])

  const easeInOutExpo = Easing.bezier(0.87, 0, 0.13, 1)

  const slideDirection = useMemo<SlideDirection>(() => {
    const directions: SlideDirection[] = [
      'from-left',
      'from-top',
      'from-right',
      'from-bottom'
    ]
    return directions[Math.floor(Math.random() * directions.length)]
  }, [])

  const slideStyle = useMemo(() => {
    const easedProgress = easeInOutExpo(progress)
    switch (slideDirection) {
      case 'from-left':
        return {
          transform: `translateX(${interpolate(easedProgress, [0, 1], [-100, 0])}%)`
        }
      case 'from-right':
        return {
          transform: `translateX(${interpolate(easedProgress, [0, 1], [100, 0])}%)`
        }
      case 'from-top':
        return {
          transform: `translateY(${interpolate(easedProgress, [0, 1], [-100, 0])}%)`
        }
      case 'from-bottom':
        return {
          transform: `translateY(${interpolate(easedProgress, [0, 1], [100, 0])}%)`
        }
    }
  }, [progress, slideDirection, easeInOutExpo])

  const style: React.CSSProperties = useMemo(() => {
    return {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      ...slideStyle,
      opacity: progress
    }
  }, [progress, slideStyle])

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>
}

/**
 * Implements a speed ramp transition for presentation components with an ease-in-out exponential effect.
 * The content fades and slides in a random direction based on the presentation progress.
 * The incoming and outgoing slides move in the same direction.
 * @param {SpeedRampProps} [props] Configuration options for the speed ramp transition: includes maxSpeed (unused in this implementation).
 * @returns {TransitionPresentation<SpeedRampProps>} Returns a transition configuration object including the component and its props.
 */
export const speedRamp = (
  props?: SpeedRampProps
): TransitionPresentation<SpeedRampProps> => {
  return {
    component: SpeedRampPresentation,
    props: props ?? {}
  }
}
