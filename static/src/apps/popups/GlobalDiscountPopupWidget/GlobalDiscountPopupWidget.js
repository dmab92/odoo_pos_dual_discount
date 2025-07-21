/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { Dialog } from "@web/core/dialog/dialog";
import { Component, useState } from "@odoo/owl";

export class GlobalDiscountPopupWidget extends Component {
    static template = "pos_dual_discount.GlobalDiscountPopupWidget";
    static components = {  Dialog };

    setup(){
        super.setup()
        this.pos = usePos();
    }
    cancel() { this.props.close();}
    async confirm() {
        var self = this;

 // if fixed discount is set
        if ((!$(".sh_discount_value").val()) &&
        (!$(".sh_discount_percent").val()))
        {
        alert("Invalide value");
        $(".sh_discount_value").addClass("invalid_number");
        }
        else if
        ($(".sh_discount_value").val() &&
            parseFloat($(".sh_discount_value").val()) > self.pos
                .get_order()
                .get_selected_orderline().price_unit ||

        ($(".sh_discount_value").val() &&
            parseFloat($(".sh_discount_value").val()) < 0) ||
        !/^\d*\.?\d*$/.test(parseFloat($(".sh_discount_value").val()))
        )
        {
        $(".sh_discount_value").addClass("invalid_number");
        $(".sh_discount_value").val(" ");
        $(".sh_discount_value").focus();
        }
         // if fixed discount is set
        else if (($(".sh_discount_value").val()))

        {
        var value = $(".sh_discount_value").val();
        value = !isNaN(value)
            ? value
            : isNaN(parseFloat(value))
            ? 0
            : formatFloat("" + value);

        if (value)
               {
            var selected_orderline = self.pos
                .get_order()
                .get_selected_orderline();
            if (selected_orderline) {
                if (selected_orderline.get_discount()) {
                var price = selected_orderline.get_display_price();
                //var price = selected_orderline.price_unit;
                var current_price = price - value;
                var discount =
                    ((selected_orderline.price_unit * selected_orderline.qty -
                    current_price) /
                    (selected_orderline.price_unit * selected_orderline.qty)) *
                    100;
                if (selected_orderline.get_fix_discount()) {
                    selected_orderline.set_total_discount(
                    selected_orderline.get_total_discount() + parseFloat(value)
                    );
                    selected_orderline.set_fix_discount(
                    selected_orderline.get_fix_discount() + parseFloat(value)
                    );
                } else {
                    selected_orderline.set_total_discount(parseFloat(value));
                    selected_orderline.set_fix_discount(parseFloat(value));
                }
                selected_orderline.set_global_discount(discount);
                selected_orderline.set_custom_discount(discount);
                } else {
                var apply_disc_percen =
                    (value * 100) / selected_orderline.get_display_price();
                selected_orderline.set_total_discount(parseFloat(value));
                selected_orderline.set_fix_discount(parseFloat(value));
                selected_orderline.set_global_discount(apply_disc_percen);
                selected_orderline.set_custom_discount(apply_disc_percen);
                self.pos.get_order().set_order_global_discount(parseFloat(value));
                }
            }
        }

  this.props.close();
        }

     // If percentage value is set
        if ((!$(".sh_discount_value").val()) &&
        (!$(".sh_discount_percent").val()))
        {
        //alert("Enter amount of discount.");
        $(".sh_discount_percent").addClass("invalid_number");
        }
        else if
        ($(".sh_discount_percent").val() &&
            parseFloat($(".sh_discount_percent").val()) > 100 ||
        ($(".sh_discount_percent").val() &&
            parseFloat($(".sh_discount_percent").val()) < 0) ||
        !/^\d*\.?\d*$/.test(parseFloat($(".sh_discount_percent").val()))
        )
        {
            $(".sh_discount_percent").addClass("invalid_number");
            $(".sh_discount_percent").val(" ");
            $(".sh_discount_percent").focus();
        }
        else
// If percentage value is set
         if (($(".sh_discount_percent").val()))
        {
        var value_percent = $(".sh_discount_percent").val();
        value_percent = !isNaN(value_percent)
            ? value_percent
            : isNaN(parseFloat(value_percent))
            ? 0
            : formatFloat("" + value_percent);
        if (value_percent)
             {     var value =value_percent

             var selected_orderline = self.pos
                .get_order()
                .get_selected_orderline();
            if (selected_orderline) {
                if (selected_orderline.get_discount()) {
                var price = selected_orderline.get_display_price();
                //var price = selected_orderline.price;
                var current_price = price - (price * value) / 100;
                var discount =
                    ((selected_orderline.price_unit * selected_orderline.qty -
                    current_price) /
                    (selected_orderline.price_unit * selected_orderline.qty)) *
                    100;
                selected_orderline.set_global_discount(discount);
                selected_orderline.set_custom_discount(discount);
                selected_orderline.set_total_discount(
                    parseFloat(selected_orderline.price) -
                    parseFloat(selected_orderline.get_display_price())
                );
                } else {
                var price = selected_orderline.get_display_price();
                var current_price = price * value / 100;
                selected_orderline.set_global_discount(parseFloat(value));
                selected_orderline.set_custom_discount(parseFloat(value));
                selected_orderline.set_total_discount(
                    parseFloat(selected_orderline.price_unit) -
                    parseFloat(selected_orderline.get_display_price())
                );
                self.pos.get_order().set_order_global_discount(parseFloat(current_price));
                }
            }
            }
  this.props.close();
        }
    }
}
