#include <SPI.h>      // Inclure la bibliothèque SPI pour la communication avec le module RFID
#include <MFRC522.h>  // Inclure la bibliothèque MFRC522 pour gérer le lecteur RFID

// Définition des broches pour le lecteur RFID
#define SS_PIN 10  // Broche SS (Slave Select) connectée au lecteur RFID
#define RST_PIN 9  // Broche RST (Reset) connectée au lecteur RFID

// Création d'une instance du module RFID avec les broches définies
MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);  // Initialisation de la communication série à 9600 bauds
  Serial.println("🔌 Arduino prêt !");  // Affichage d'un message indiquant que l'Arduino est prêt

  SPI.begin();  // Initialisation du protocole SPI pour communiquer avec le module RFID
  rfid.PCD_Init();  // Initialisation du module MFRC522

  // Vérification et affichage de la version du firmware du module MFRC522
  Serial.print("MFRC522 software version = ");
  Serial.println(rfid.PCD_ReadRegister(rfid.VersionReg), HEX);

  // Affichage d'un message JSON pour indiquer que le lecteur RFID est prêt
  Serial.println("{ \"status\": \"Ready\", \"message\": \"Place une carte RFID sur le lecteur\" }");
}

void loop() {
  // Vérifie si une nouvelle carte RFID est détectée
  if (!rfid.PICC_IsNewCardPresent()) {
    return;  // Sort de la fonction si aucune carte n'est présente
  }

  // Tente de lire l'UID de la carte détectée
  if (!rfid.PICC_ReadCardSerial()) {
    return;  // Sort de la fonction si la lecture de l'UID échoue
  }

  // Affichage de l'UID sous forme de JSON
  Serial.print("{ \"status\": \"Success\", \"uid\": \"");

  // Boucle pour parcourir chaque octet de l'UID de la carte
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      Serial.print("0");  // Ajoute un zéro devant les valeurs inférieures à 0x10 pour garder un format uniforme
    }
    Serial.print(rfid.uid.uidByte[i], HEX);  // Affiche l'UID en format hexadécimal
  }

  Serial.println("\" }");  // Termine et affiche la chaîne JSON

  rfid.PICC_HaltA();  // Arrête la communication avec la carte RFID pour permettre la lecture d'une nouvelle carte
}