const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    try {
        const sessions = await stripe.checkout.sessions.list({
            limit: 20,
            expand: ['data.line_items']
        });

        // SADECE 'paid' olanları getir
        const paidOrders = sessions.data
            .filter(session => session.payment_status === 'paid')
            .map(session => ({
                id: session.id,
                amount: session.amount_total / 100,
                items: session.line_items?.data.map(item => item.description).join(', '),
                note: session.metadata?.note || "No Note",
                time: new Date(session.created * 1000).toLocaleTimeString('en-GB')
            }));

        res.status(200).json(paidOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
