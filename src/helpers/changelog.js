export const logTypes = {
  BUG: 'bug',
  FEATURE: 'fonctionnalité',
  NEW: 'nouveauté'
}

export default [
  {
    date: '1562621003832',
    type: logTypes.BUG,
    title: 'Meilleures performances entre les chapitres',
    description: "Quand on changeait de chapitre, ça pouvait prendre un certain temps. Maintenant c'est quasiment instantané."
  },
  {
    date: '1562583055833',
    type: logTypes.FEATURE,
    title: 'Ajout de péricopes - titres de sections',
    description: "J'ai appris ce mot il y a deux jours, je l'avoue. Péricope vient du mot 'découpage'. En résumé vous avez maintenant les titres ou sections des différentes parties d'un texte biblique."
  },
  {
    date: '1562470112286',
    type: logTypes.BUG,
    title: 'Texte italique sur Android',
    description: "Dans certains endroits de l'App, le texte était italique. Ce bug a été réglé."
  },
  {
    date: '1562469387018',
    type: logTypes.NEW,
    title: 'Ajout de "Quoi de neuf ?"',
    description: "Vous serez dorénavant tenu au courant de chaque modification dans l'App."
  },
  {
    date: '1562460467170',
    type: logTypes.BUG,
    title: 'Vibration désactivée',
    description: "Lorsqu'on sélectionne un verset, le téléphone vibrait très légèrement. Un utilisateur a remonté une erreur critique à ce niveau. J'ai désactivé pour l'instant la vibration."
  },
  {
    date: '1562459400000',
    type: logTypes.BUG,
    title: 'Bible LSG',
    description: "Il y a avait pas mal de soucis d'espace pour la Bible Louis Segond. Ce souci a été réglé."
  }
]
