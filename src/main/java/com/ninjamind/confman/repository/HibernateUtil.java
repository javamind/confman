package com.ninjamind.confman.repository;

import org.hibernate.proxy.HibernateProxy;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class HibernateUtil {
    /**
     * Prend un objet qui peut être un proxy hibernate, l'initialise si nécessaire, et retourne
     * l'instance d'objet à laquelle délègue le proxy. Si l'objet passé n'est pas un proxy,
     * l'objet lui-même est casté et retourné. <br/>
     * Cette méthode est utile lorsqu'une entité (exemple : LigneDExpedition) contient une instance
     * d'objet dont il existe plusieurs sous-classes (exemple : AbstractLigneDEnvoi), et qu'il faut
     * connaître et pouvoir utiliser le type concret de l'objet, tout en conservant le lazy-loading
     * via proxy, plus performant que le lazy-loading sans proxy.<br/>
     * Consulter le chapitre sur l'héritage du document ARCHIL_Normes_Oracle_Hibernate-XX.doc pour
     * plus de détails.<br/>
     * Exemple d'utilisation :
     * <pre>
     *   public class LigneDExpedition {
     *       // ...
     *       &#064;ManyToOne(fetch = FetchType.LAZY)
     *       private AbstractLigneDEnvoi ligneDEnvoi;
     *
     *       public AbstractLigneDEnvoi getLigneDEnvoi() {
     *           return HibernateUtil.deproxifier(this.ligneDEnvoi, AbstractLigneDEnvoi.class);
     *       }
     *   }
     * </pre>
     * @param <T> le type de base de l'objet (exemple : AbstractLigneDEnvoi)
     * @param objetADeproxifier l'objet à déproxifier
     * @param classeDeBaseDeLObjet la classe de base de l'objet, vers laquelle le résultat de la
     * déproxification est casté (exemple : AbstractLigneDEnvoi)
     * @return l'objet déproxifié
     * @throws ClassCastException dans le cas où l'objet déproxifié n'est pas une instance de la
     * classe donnée
     */
    public static <T> T unproxy(Object objetADeproxifier, Class<T> classeDeBaseDeLObjet) throws ClassCastException {
        if (objetADeproxifier instanceof HibernateProxy) {
            return classeDeBaseDeLObjet.cast(((HibernateProxy) objetADeproxifier).getHibernateLazyInitializer().getImplementation());
        }
        else {
            return classeDeBaseDeLObjet.cast(objetADeproxifier);
        }
    }
}
