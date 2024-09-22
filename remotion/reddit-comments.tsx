import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

// Zod schema definitions
const commentSchema = z.object({
	author: z.string(),
	body: z.string(),
	score: z.number()
});

const postSchema = z.object({
	title: z.string()
});

const redditDataSchema = z.object({
	post: postSchema,
	comments: z.array(commentSchema).max(5) // Limit to top 5 comments
});

export const redditVideoSchema = z.object({
	data: redditDataSchema
});

type Props = z.infer<typeof redditVideoSchema>;

// Title component
const Title: React.FC<{ title: string }> = ({ title }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

	return (
		<div
			style={{
				fontFamily: 'Arial, sans-serif',
				fontSize: 32,
				fontWeight: 'bold',
				textAlign: 'center',
				color: 'white',
				opacity,
				padding: 16,
				backgroundColor: '#1a1a1b',
				borderRadius: 8,
				margin: 16
			}}
		>
			{title}
		</div>
	);
};

// Comment component
const Comment: React.FC<z.infer<typeof commentSchema>> = ({ author, body, score }) => {
	return (
		<div
			style={{
				fontFamily: 'Arial, sans-serif',
				fontSize: 20,
				color: 'white',
				backgroundColor: '#272729',
				borderRadius: 8,
				padding: 16,
				margin: '8px 16px'
			}}
		>
			<div style={{ fontWeight: 'bold', marginBottom: 8 }}>
				{author} • {score} points
			</div>
			<div>{body}</div>
		</div>
	);
};

// Main RedditVideo component
export const RedditVideo: React.FC<Props> = ({ data }) => {
	const frame = useCurrentFrame();
	const { height, fps, durationInFrames } = useVideoConfig();

	const { post, comments } = data;

	const scrollY = interpolate(frame, [fps * 3, durationInFrames], [0, -comments.length * 120], {
		extrapolateRight: 'clamp'
	});

	return (
		<AbsoluteFill style={{ backgroundColor: '#030303' }}>
			<Sequence durationInFrames={fps * 3}>
				<Title title={post.title} />
			</Sequence>
			<Sequence from={fps * 3}>
				<AbsoluteFill style={{ top: height }}>
					<div style={{ transform: `translateY(${scrollY}px)` }}>
						{comments.map((comment, index) => (
							<Comment
								key={index}
								author={comment.author}
								body={comment.body}
								score={comment.score}
							/>
						))}
					</div>
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
