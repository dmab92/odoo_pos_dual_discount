/** @odoo-module */
/**
 * Patch ProductScreen to change the Discount button label from "%" to "RABAIS" (Odoo 18, ES module).
 */
import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";

const _superGetNumpadButtons = ProductScreen.prototype.getNumpadButtons;

patch(ProductScreen.prototype, {
    
    getNumpadButtons() {
        const buttons = _superGetNumpadButtons.apply(this, arguments);
        // Debug: confirm patch loaded once per screen render
        // Note: comment out later if too verbose
        console.debug("[pos_rabais_custom] Patching discount button label to RABAIS");
        const updated = buttons.map((b) => (b.value === "discount" ? { ...b, text: _t("RABAIS") } : b));
        // Extra safety: if map didn't find any, try to mutate by index
        if (!updated.some((b) => b.value === "discount" && b.text === _t("RABAIS"))) {
            const idx = buttons.findIndex((b) => b.value === "discount");
            if (idx >= 0) {
                updated[idx] = { ...buttons[idx], text: _t("RABAIS") };
            }
        }
        return updated;
    },
});


