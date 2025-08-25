# -*- coding: utf-8 -*-
# Part of Softhealer Technologies.

import stripe
from datetime import datetime, timezone
from odoo import models, fields, api



class StripeCharge(models.Model):
    _name = 'stripe.charge'
    _description = 'Stripe Charge'

    report_id = fields.Many2one('stripe.report', string='Report', ondelete='cascade')
    transaction_id = fields.Char(string='Transaction ID')
    created = fields.Datetime(string='Created')
    amount = fields.Float(string='Amount')
    currency = fields.Char(string='Currency')
    status = fields.Char(string='Status')
    payment_method_type = fields.Char(string='Payment Method Type')
    funding = fields.Char(string='Funding')
    brand = fields.Char(string='Card Brand')
    last4 = fields.Char(string='Card Last4')
    receipt_number = fields.Char(string='Receipt Number')
    terminal_id = fields.Char(string='Terminal ID')




class StripeReport(models.Model):
    _name = 'stripe.report'
    _description = 'Stripe Charges Report'

    name = fields.Char("Sequence No")
    date_start = fields.Date(string='Start Date')
    date_end = fields.Date(string='End Date')
    charge_ids = fields.One2many('stripe.charge', 'report_id', string='Charges')

    def fetch_charges(self):
        self.ensure_one()

        # Set your Stripe secret key securely, e.g. from Odoo config or env var
        stripe.api_key = self.env['ir.config_parameter'].sudo().get_param('stripe.secret_key')

        # Convert date_start and date_end to timestamps in UTC
        start_ts = int(datetime.combine(self.date_start, datetime.min.time()).replace(tzinfo=timezone.utc).timestamp())
        end_ts = int(datetime.combine(self.date_end, datetime.max.time()).replace(tzinfo=timezone.utc).timestamp())

        charges_data = []
        # Fetch charges from Stripe API with created filter
        charges = stripe.Charge.list(limit=100, created={'gte': start_ts, 'lte': end_ts})

        for charge_full in charges.auto_paging_iter():
            pm = charge_full.payment_method_details or {}

            # Extract fields safely with fallbacks
            funding = (
                pm.get('card', {}).get('funding') or
                pm.get('card_present', {}).get('funding') or
                pm.get('interac_present', {}).get('funding') or
                'n/a'
            )
            brand = (
                pm.get('card', {}).get('brand') or
                pm.get('card_present', {}).get('brand') or
                pm.get('interac_present', {}).get('brand') or
                'n/a'
            )
            last4 = (
                pm.get('card', {}).get('last4') or
                pm.get('card_present', {}).get('last4') or
                pm.get('interac_present', {}).get('last4') or
                'n/a'
            )
            receipt_number = (
                pm.get('card_present', {}).get('receipt_number') or
                pm.get('interac_present', {}).get('receipt_number') or
                'n/a'
            )
            terminal_id = (
                pm.get('terminal', {}).get('reader_id') or
                pm.get('terminal', {}).get('id') or
                charge_full.metadata.get('terminal_id') or
                'n/a'
            )

            charges_data.append({
                'transaction_id': charge_full.id,
                'created': datetime.fromtimestamp(charge_full.created, tz=timezone.utc),
                'amount': charge_full.amount / 100,
                'currency': charge_full.currency,
                'status': charge_full.status,
                'payment_method_type': pm.get('type', 'n/a'),
                'funding': funding,
                'brand': brand,
                'last4': last4,
                'receipt_number': receipt_number,
                'terminal_id': terminal_id,
            })

        # Clear old data and create new
        self.charge_ids.unlink()
        self.charge_ids = [(0, 0, vals) for vals in charges_data]
