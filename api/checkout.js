const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        const { cart, address, note } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            phone_number_collection: { enabled: true },
            line_items: cart.map(item => ({
                price_data: {
                    currency: 'gbp',
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${req.headers.origin}/`,
            cancel_url: `${req.headers.origin}/`,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
