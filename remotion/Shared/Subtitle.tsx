<<<<<<< HEAD
import React from 'react'
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { CaptionStyle } from '../../stores/templatestore'
import { Word } from './Word'
=======
<<<<<<< HEAD
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CaptionStyle } from "../../stores/templatestore";
import { Word } from "./Word";
>>>>>>> af61001 (fix: add text styling inputs)

const Subtitle: React.FC<{
  text: string
  captionStyle: CaptionStyle
  style?: React.CSSProperties
}> = ({ text, captionStyle, style }) => {
<<<<<<< HEAD
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
=======
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
=======
import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { cn } from '../../lib/utils';
import { CaptionStyle } from '../../stores/templatestore';
import { Word } from './Word';

const Subtitle: React.FC<{
	text: string;
	captionStyle: CaptionStyle;
	className?: string;
	style?: React.CSSProperties;
}> = ({ text, captionStyle, className, style }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
>>>>>>> 5a0e5df (fix: add text styling inputs)
>>>>>>> af61001 (fix: add text styling inputs)

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200
    },
    durationInFrames: 5
  })

<<<<<<< HEAD
  return (
    <AbsoluteFill style={style}>
      <Word
        stroke
        enterProgress={enter}
        text={text}
        captionStyle={captionStyle}
      />
      <Word
        enterProgress={enter}
        text={text}
        stroke={false}
        captionStyle={captionStyle}
      />
    </AbsoluteFill>
<<<<<<< HEAD
  )
}
=======
  );
=======
	return (
		<div className={cn('w-full absolute', className)} style={style}>
			<Word stroke enterProgress={enter} text={text} captionStyle={captionStyle} />
			<Word enterProgress={enter} text={text} captionStyle={captionStyle} />
		</div>
	);
>>>>>>> 5a0e5df (fix: add text styling inputs)
};
>>>>>>> af61001 (fix: add text styling inputs)

export default Subtitle
