<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $utilisateur;

    /**
     * Create a new message instance.
     */
    public function __construct($utilisateur)
    {
        $this->utilisateur = $utilisateur;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Votre compte a été créé avec succès')
                    ->view('emails.account_created')
                    ->with([
                        'nom' => $this->utilisateur->nom,
                        'prenom' => $this->utilisateur->prenom,
                        'email' => $this->utilisateur->email,
                        'password' => 'password123',
                    ]);
    }
}

