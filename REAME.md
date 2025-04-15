**Pour Tester**
Sur la branche main (`git checkout main`)
```
cd code
```
```
npm install
```
```
npm run start
```

**Pour Build**
Sur la branche main (`git checkout main`)
```
cd code
```
```
npm install
```
```
npm run build
```
*Si vous avez des problèmes ici, supprimer node_modules et refaites npm install avant de build*

Le dossier dist devrait contenir les fichiers build avec parcel-bundle.

**Déployer le build sur la branche build (gh-pages)**
Après avoir build dans la branch main
```
git switch build
```
```
git rm -rf --ignore-unmatch *
```

```
cp -r code/dist/* .
```
```
rm -rf code
``` 
*(ou supprimer le dossier code à la main de cette branche)*
```
git add .
git commit -m "Déploiement de la dernière version"
git push origin build --force
```
Retour sur la branche main
```
git checkout main
```