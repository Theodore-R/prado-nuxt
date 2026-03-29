## Usage
`/project:generate-breeds`

## Context
- Fichier de suivi : `breeds-tracker.json` (à la racine du projet)
- Dossier de sortie des images : `breeds-images/`
- Outil de génération : nano-banana (Gemini Image API)

## Your Role
Tu es un assistant de génération d'images de races de chiens en bulk. Tu utilises le skill nano-banana pour générer les images une par une, et tu suis la progression dans un fichier tracker.

## Données : liste complète des races

Voici les races à traiter, classées par groupe FCI :

### Groupe 1 — Chiens de berger et de bouvier
Berger Allemand, Berger Australien, Berger Belge Malinois, Berger Belge Tervueren, Berger Belge Groenendael, Berger Belge Laekenois, Berger des Shetland, Berger Blanc Suisse, Border Collie, Colley à poil long, Colley à poil court, Beauceron, Briard, Berger de Brie, Berger Picard, Bouvier des Flandres, Bouvier Bernois, Bouvier Australien, Welsh Corgi Pembroke, Welsh Corgi Cardigan, Puli, Pumi, Komondor, Kuvasz, Berger de Maremme, Schipperke, Berger Hollandais, Mudi, Berger Catalan, Berger de Bergame, Berger Polonais de Plaine, Berger d'Anatolie, Berger du Caucase, Berger d'Asie Centrale

### Groupe 2 — Chiens de type Pinscher et Schnauzer, Molossoïdes
Boxer, Rottweiler, Dobermann, Dogue Allemand, Bullmastiff, Mastiff, Dogue de Bordeaux, Cane Corso, Mâtin Napolitain, Saint-Bernard, Terre-Neuve, Leonberg, Landseer, Schnauzer Géant, Schnauzer Moyen, Schnauzer Nain, Pinscher Allemand, Pinscher Nain, Affenpinscher, Bouledogue Français, Bulldog Anglais, Shar Pei, Dogue du Tibet, Fila Brasileiro, Tosa, Hovawart, Broholmer

### Groupe 3 — Terriers
Jack Russell Terrier, Bull Terrier, Staffordshire Bull Terrier, American Staffordshire Terrier, Fox Terrier à poil lisse, Fox Terrier à poil dur, Airedale Terrier, Yorkshire Terrier, West Highland White Terrier, Scottish Terrier, Cairn Terrier, Border Terrier, Kerry Blue Terrier, Soft Coated Wheaten Terrier, Bedlington Terrier, Irish Terrier, Welsh Terrier, Norfolk Terrier, Norwich Terrier, Parson Russell Terrier, Skye Terrier, Sealyham Terrier, Dandie Dinmont Terrier, Silky Terrier, Terrier Australien

### Groupe 4 — Teckels
Teckel à poil ras, Teckel à poil dur, Teckel à poil long

### Groupe 5 — Chiens de type Spitz et primitif
Akita Inu, Shiba Inu, Husky Sibérien, Malamute de l'Alaska, Samoyède, Spitz Loup (Keeshond), Spitz Allemand Nain (Poméranien), Spitz Finlandais, Chow-Chow, Eurasier, Basenji, Shikoku, Kai, Kishu, Hokkaido, Elkhound Norvégien, Laïka de Sibérie Occidentale, Spitz Japonais, Volpino Italien, Chien du Pharaon, Cirneco de l'Etna, Podenco d'Ibiza, Podenco Canario, Chien Nu du Mexique (Xoloitzcuintle), Chien Nu du Pérou, Chien Thaïlandais à Crête Dorsale

### Groupe 6 — Chiens courants et de recherche au sang
Beagle, Basset Hound, Dalmatien, Rhodesian Ridgeback, Petit Basset Griffon Vendéen, Grand Basset Griffon Vendéen, Bloodhound, Porcelaine, Grand Bleu de Gascogne, Ariégeois, Billy, Anglo-Français Tricolore, Chien de Saint-Hubert, Foxhound Anglais, Foxhound Américain, Harrier, Otterhound, Basset Artésien Normand, Basset Fauve de Bretagne, Griffon Nivernais, Griffon Bleu de Gascogne, Grand Griffon Vendéen, Briquet Griffon Vendéen, Chien Courant de Hamilton

### Groupe 7 — Chiens d'arrêt
Braque Allemand à poil court, Braque de Weimar, Setter Anglais, Setter Irlandais, Setter Gordon, Pointer Anglais, Épagneul Breton, Braque Français, Braque Hongrois à poil court (Vizsla), Braque Hongrois à poil dur, Braque Italien, Spinone Italien, Drahthaar, Petit Münsterländer, Grand Münsterländer, Griffon d'arrêt à poil dur Korthals, Épagneul de Pont-Audemer, Épagneul Picard, Épagneul Bleu de Picardie, Épagneul Français, Barbu Tchèque, Stabyhoun, Pudelpointer

### Groupe 8 — Chiens rapporteurs, leveurs, d'eau
Labrador Retriever, Golden Retriever, Flat-Coated Retriever, Chesapeake Bay Retriever, Nova Scotia Duck Tolling Retriever, Curly-Coated Retriever, Cocker Spaniel Anglais, Cocker Spaniel Américain, Springer Spaniel Anglais, Springer Spaniel Gallois, Clumber Spaniel, Field Spaniel, Sussex Spaniel, Irish Water Spaniel, Barbet, Chien d'Eau Portugais, Chien d'Eau Espagnol, Lagotto Romagnolo, Chien d'Eau Américain, Chien d'Eau Frison

### Groupe 9 — Chiens d'agrément et de compagnie
Caniche (Toy, Nain, Moyen, Grand), Bichon Frisé, Bichon Maltais, Bichon Havanais, Bichon Bolonais, Cavalier King Charles Spaniel, King Charles Spaniel, Carlin (Pug), Bouledogue Français, Shih Tzu, Lhassa Apso, Pékinois, Épagneul Tibétain, Terrier Tibétain, Chihuahua, Papillon, Phalène, Coton de Tuléar, Petit Chien Lion (Löwchen), Griffon Bruxellois, Griffon Belge, Petit Brabançon, Chien Chinois à Crête, Russkiy Toy, Prague Ratter (Prazsky Krysarik), Kromfohrländer, Bolonka

### Groupe 10 — Lévriers
Lévrier Afghan, Saluki, Barzoi, Lévrier Irlandais (Irish Wolfhound), Deerhound (Lévrier Écossais), Greyhound, Whippet, Lévrier Italien (Petit Lévrier Italien), Galgo Espagnol, Sloughi, Azawakh, Lévrier Hongrois (Magyar Agar), Lévrier Polonais (Chart Polski)

## Process

### Étape 1 : Charger le tracker
Lire `breeds-tracker.json` à la racine du projet. S'il n'existe pas, le créer avec cette structure :
```json
{
  "output_dir": "breeds-images",
  "completed": [],
  "failed": [],
  "total_breeds": 0
}
```

### Étape 2 : Proposer un batch
1. Comparer la liste complète des races (ci-dessus) avec `completed` et `failed` dans le tracker
2. Calculer combien de races restent à faire
3. Afficher un résumé :
   ```
   Progression : X / Y races générées (Z en échec)
   Races restantes : N
   ```
4. Proposer un batch de **10 races** (les prochaines non traitées dans l'ordre de la liste)
5. Lister les 10 races du batch et **attendre la confirmation de l'utilisateur** avant de lancer

### Étape 3 : Générer les images
Pour chaque race du batch confirmé :

1. Construire le prompt :
   ```
   Fais-moi une image au format 4/3 où l'on voit au centre de l'image un chien adulte en entier, côté gauche (la tête du côté gauche de l'image), regardant vers nous et de race {nom de la race}.
   ```

2. Construire le nom de fichier : slugifier le nom de la race (minuscules, espaces → tirets, pas d'accents)
   - Exemple : "Berger Allemand" → `berger-allemand.png`
   - Exemple : "Épagneul Breton" → `epagneul-breton.png`

3. Exécuter nano-banana :
   ```bash
   python ~/.claude/skills/nano-banana/scripts/gemini_image.py \
     "Fais-moi une image au format 4/3 où l'on voit au centre de l'image un chien adulte en entier, côté gauche (la tête du côté gauche de l'image), regardant vers nous et de race {nom de la race}." \
     --output breeds-images/{slug}.png \
     --aspect 4:3 \
     --size 2K \
     --model gemini-2.5-flash-image
   ```

4. Après chaque image :
   - Si succès : ajouter la race à `completed` dans le tracker, sauvegarder le fichier
   - Si échec : ajouter la race à `failed` avec le message d'erreur, continuer avec la suivante
   - Afficher la progression : `[X/10] Race générée avec succès` ou `[X/10] ÉCHEC : raison`

### Étape 4 : Bilan du batch
Après les 10 images :
1. Mettre à jour `breeds-tracker.json`
2. Afficher le bilan :
   ```
   Batch terminé : X succès, Y échecs
   Progression totale : A / B races (C en échec)
   ```
3. Proposer de lancer le batch suivant ou de retenter les échecs

## Règles importantes

- **Ne JAMAIS régénérer une race déjà dans `completed`** (sauf si l'utilisateur le demande explicitement)
- **Toujours sauvegarder le tracker après chaque image** (pas à la fin du batch) pour ne pas perdre la progression si la session s'interrompt
- **Créer le dossier `breeds-images/`** s'il n'existe pas
- Les races dans `failed` peuvent être retentées — proposer cette option dans le bilan
- Si l'utilisateur demande de régénérer une race spécifique, la retirer de `completed` avant de relancer
