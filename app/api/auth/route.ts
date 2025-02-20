// Clerk Webhook
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { error } from 'console'


export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  console.log(supabaseKey);
  const client = createClient(supabaseUrl, supabaseKey);

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the user.created event
  const eventType = evt.type
  if (eventType === 'user.created') {
    console.log("USER CREATED")
    try {
      const id = evt.data.id


      // Prepare the user data
      const userData = {
        id: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        firstname: evt.data.first_name as string,
        lastname: evt.data.last_name as string,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await client.from('users').insert(userData).select().single();
      console.log(data);

      if (error) {
        console.error('Error adding user to Supabase:', error)
        return NextResponse.error()
      }

      return NextResponse.json({
        data: data,
        message: 'Successfully added user to Supabase',
      })
    } catch (e) {
      console.error('Error adding user to Supabase:', error)
      return NextResponse.error()
    }
  }

  return new Response('', { status: 200 })
}
