import { FaTiktok } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa6';
import { RiInstagramFill } from 'react-icons/ri';

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
	name: 'Clip Studio',
	description:
		'Create viral short-form videos with AI. Instantly upload your video to TikTok, YouTube, and Instagram. Grow your audience effortlessly.',
	url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clip.studio',
	keywords: [
		'AI Video Creation',
		'Social Media Content',
		'Video Editing',
		'TikTok Marketing',
		'Instagram Video',
		'Faceless Channels',
		'YouTube Shorts'
	],
	links: {
		email: 'hello@clip.studio',
		twitter: 'https://twitter.com/useclipstudio',
		instagram: 'https://instagram.com/useclipstudio',
		tiktok: 'https://www.tiktok.com/@useclipstudio',
		facebook: 'https://www.facebook.com/people/Clip-Studio/61563040940243/',
		youtube: 'https://youtube.com/@useclipstudio',
		linkedin: 'https://www.linkedin.com/company/clipstudio/',
		affiliate: 'https://clip.studio/affiliate'
	},
	faqs: [
		{
			question: 'What is Clip Studio?',
			answer: (
				<span>
					Clip Studio is a powerful AI-driven tool designed to help you generate viral short videos
					for platforms like YouTube, TikTok, and Instagram. It allows users to effortlessly create
					engaging and shareable content that captivates audiences.
				</span>
			)
		},
		{
			question: 'How does Clip Studio work?',
			answer: (
				<span>
					Clip Studio utilizes artificial intelligence to generate unique and attention-grabbing
					videos in minutes. It&apos;s specifically tailored for short-form video content,
					optimizing your videos for virality and increasing their chances of reaching a wider
					audience.
				</span>
			)
		},
		{
			question: 'What platforms does Clip Studio support?',
			answer: (
				<span>
					Clip Studio is designed to create content for major social media platforms, including
					YouTube (especially Shorts), TikTok, and Instagram. It also supports direct scheduling and
					posting to these platforms from within the app.
				</span>
			)
		},
		{
			question: 'Is Clip Studio suitable for beginners?',
			answer: (
				<span>
					Yes, Clip Studio is designed to be user-friendly for both beginners and experienced
					content creators. It eliminates the need for complicated editing software, providing a
					streamlined and efficient video creation experience.
				</span>
			)
		},
		{
			question: 'What kind of videos can I create with Clip Studio?',
			answer: (
				<span>
					With Clip Studio, you can create a wide variety of short-form videos, including but not
					limited to viral content, educational clips, product showcases, and entertaining shorts.
					It&apos;s particularly useful for creating faceless videos, making it ideal for creators
					who prefer to remain behind the camera.
				</span>
			)
		}
	],
	footer: [
		{
			title: 'Social',
			links: [
				{
					href: 'https://instagram.com/useclipstudio',
					text: 'Instagram',
					icon: <RiInstagramFill />
				},
				{
					href: 'https://www.tiktok.com/@useclipstudio',
					text: 'TikTok',
					icon: <FaTiktok />
				},
				{
					href: 'https://youtube.com/@useclipstudio',
					text: 'YouTube',
					icon: <FaYoutube />
				}
			]
		}
	]
};

export type SiteConfig = typeof siteConfig;
