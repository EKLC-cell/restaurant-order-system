const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // Sadece son 10 başarılı siparişi getir
    try {
        const sessions = await stripe.checkout.sessions.list({
            limit: 10,
            expand: ['data.line_items']
        });

        const orders = sessions.data.map(session => ({
            id: session.id,
            customer: session.customer_details?.name || "Bilinmiyor",
            amount: session.amount_total / 100,
            items: session.line_items?.data.map(item => item.description).join(', '),
            // Hatırlarsan notun içine [SİPARİŞ NO] eklemiştik, onu buradan okuyacağız
            note: session.metadata?.note || "Not yok", 
            time: new Date(session.created * 1000).toLocaleTimeString('tr-TR')
        }));

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
