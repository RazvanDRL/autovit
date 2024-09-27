import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

// stripe listen --forward-to http://localhost:3000/api/webhook

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ message: 'Missing Stripe signature' }, { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (error: any) {
            console.error(`Webhook signature verification failed: ${error.message}`);
            return NextResponse.json({ message: 'Webhook Error' }, { status: 400 });
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const clientReferenceId = session.client_reference_id;

            if (!clientReferenceId) {
                return NextResponse.json({ message: 'Missing client reference ID' }, { status: 400 });
            }

            // Fetch user profile using client reference ID (user ID)
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('credits')
                .eq('id', clientReferenceId)
                .single();

            if (profileError) {
                console.error('Error fetching user profile:', profileError.message);
                return NextResponse.json({ message: 'Error fetching user profile' }, { status: 500 });
            }

            const newCredits = (profile?.credits || 0) + 100;
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    credits: newCredits,
                })
                .eq('id', clientReferenceId);

            if (updateError) {
                console.error('Error updating profile:', updateError.message);
                return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Webhook processed successfully' });
    } catch (error: any) {
        console.error('Unexpected error:', error.message);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}