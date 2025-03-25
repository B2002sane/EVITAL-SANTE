<?php

namespace App\Mail;


use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\RendezVous;

class RendezVousNotification extends Mailable
{
    use SerializesModels;

    public $rendezVous;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\RendezVous  $rendezVous
     * @return void
     */
    public function __construct(RendezVous $rendezVous)
    {
        $this->rendezVous = $rendezVous;
    }

    /**
     * Build the message.
     *
     * @return $this
     */

     public function build()
     {
         return $this->subject('Votre rendez-vous avec le médecin')
                     ->view('emails.rendezvous') // Assurez-vous que le chemin est correct
                     ->with([
                         'rendezVous' => $this->rendezVous,
                     ]);
     }
     
     


}

