'use client';

import { submitFeedback } from '@/actions/db/user-queries';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useServerAction } from 'zsa-react';

// Define the form schema with Zod
const formSchema = z.object({
	feedbackType: z.enum(['bug', 'feature', 'improvement', 'other'], {
		required_error: 'Please select a feedback type.'
	}),
	rating: z.number().min(1).max(5),
	comment: z.string().min(10, {
		message: 'Comment must be at least 10 characters.'
	})
});

export default function FeedbackDialog() {
	const router = useRouter();
	const { isPending, execute } = useServerAction(submitFeedback);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			feedbackType: undefined,
			rating: 0,
			comment: ''
		}
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const [_data, err] = await execute(values);
		if (err) {
			toast.error(err.message);
		} else {
			toast.success('Feedback Submitted', {
				description: 'Thank you for your feedback!'
			});
			router.back();
			form.reset();
		}
	}

	const StarRating = ({ field }: { field: any }) => {
		return (
			<div className="flex">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`w-6 h-6 cursor-pointer ${star <= field.value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
						onClick={() => field.onChange(star)}
					/>
				))}
			</div>
		);
	};

	return (
		<Dialog open={true} onOpenChange={(open) => !open && router.back()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Provide Feedback</DialogTitle>
					<DialogDescription>
						We value your input! Please share your thoughts with us.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="feedbackType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Feedback Type</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select feedback type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="bug">Bug Report</SelectItem>
											<SelectItem value="feature">Feature Request</SelectItem>
											<SelectItem value="improvement">Improvement Suggestion</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="rating"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rating</FormLabel>
									<FormControl>
										<StarRating field={field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="comment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your Feedback</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Please provide details about your feedback..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Submit Feedback
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
