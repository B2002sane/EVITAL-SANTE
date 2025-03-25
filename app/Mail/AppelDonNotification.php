<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\DemandeDon;

class AppelDonNotification extends Mailable
{
    use SerializesModels;

    public $demandeDon;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\DemandeDon  $demandeDon
     * @return void
     */
    public function __construct(DemandeDon $demandeDon)
    {
        $this->demandeDon = $demandeDon;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Appel à la donation de sang')
                    ->view('emails.appel_don')
                    ->with([
                        'demandeDon' => $this->demandeDon,
                    ]);
    }
}
