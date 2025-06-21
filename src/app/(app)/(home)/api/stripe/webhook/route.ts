import type { Stripe } from 'stripe';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import { ExpandedLineItem } from '@/modules/checkout/types';

export async function POST(req: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await req.blob()).text(),
            req.headers.get('stripe-signature') as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (error instanceof Error) {
            console.error('Stripe webhook error:', error);
        }

        console.error('Stripe webhook error:', errorMessage);
        return NextResponse.json(
            { message: `Webhook Error: ${errorMessage}` },
            { status: 400 }
        );
    }

    console.log('Received Stripe event:', event.type);

    const permittedEvents: string[] = [
        'checkout.session.completed',
    ]

    if (!permittedEvents.includes(event.type)) {
        console.warn(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true }, { status: 200 });
    }
    try {
        const payload = await getPayload({ config });

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('Processing checkout.session.completed for session:', session.id);

                if (!session.metadata?.userId) {
                    throw new Error("User ID not found in session metadata");
                }

                const user = await payload.findByID({
                    collection: 'users',
                    id: session.metadata.userId,
                });

                if (!user) {
                    throw new Error(`User with ID ${session.metadata.userId} not found`);
                }

                const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items.data.price.product'],
                });

                if (
                    !expandedSession.line_items?.data ||
                    !expandedSession.line_items.data.length
                ) {
                    console.warn(`No line items found for session: ${session.id}`);
                    throw new Error(`No line items found for session: ${session.id}`);
                }

                const lineItems = expandedSession.line_items.data as ExpandedLineItem[];

                for (const item of lineItems) {
                    await payload.create({
                        collection: 'orders',
                        data: {
                            user: user.id,
                            stripeCheckoutSessionId: session.id,
                            product: item.price.product.metadata.id,
                            name: item.price.product.name,
                        },
                    });
                }

                break;
            }
            default:
                console.warn(`Unhandled event type: ${event.type}`);
                throw new Error(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error processing Stripe event:', errorMessage);
        return NextResponse.json(
            { message: `Error processing event: ${errorMessage}` },
            { status: 500 }
        );
    }

}