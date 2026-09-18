<?php
// Inclure l'autoloader de Composer si vous utilisez la bibliothèque officielle
require_once 'vendor/autoload.php';

// Configuration des clés API PayDunya (Mode Live)
\PayDunya\Setup::setMasterKey("wd15Z7iL-bQRa-npnV-Ezsk-wfFWeBHVXq0R");
\PayDunya\Setup::setPublicKey("live_public_m3pmmvSnWW5l5KNqjrIixvvAxv");
\PayDunya\Setup::setPrivateKey("live_private_fklvSTzjbhkGT2YA0qECGMPSQ13");
\PayDunya\Setup::setToken("bHBt40RkjUei8uQ6gmgH");
\PayDunya\Setup::setMode("live");

// Vérifier si le montant a bien été envoyé via le formulaire POST
if (isset($_POST['montant']) && !empty($_POST['montant'])) {
    $montant_client = intval($_POST['montant']);

    // Sécurité : Empêcher les montants négatifs ou nuls
    if ($montant_client <= 0) {
        die("Montant invalide.");
    }

    try {
        $invoice = new \Paydunya\Checkout\Invoice();
        
        // Ajouter l'article / le montant libre
        $invoice->addItem("Recharge Nova Invest", 1, $montant_client, $montant_client);
        $invoice->setTotalAmount($montant_client);

        // URLs de redirection après paiement (À adapter avec votre URL réelle)
        $invoice->setReturnUrl("https://votre-site.vercel.app/");
        $invoice->setCancelUrl("https://votre-site.vercel.app/");

        // Création de la facture sur les serveurs PayDunya
        if ($invoice->create()) {
            // Redirection vers la page de paiement sécurisée PayDunya
            header("Location: " . $invoice->getInvoiceUrl());
            exit();
        } else {
            echo "Erreur lors de la création de la facture : " . htmlspecialchars($invoice->response_message);
        }
    } catch (Exception $e) {
        echo "Erreur technique : " . $e->getMessage();
    }
} else {
    echo "Aucun montant spécifié.";
}
?>
