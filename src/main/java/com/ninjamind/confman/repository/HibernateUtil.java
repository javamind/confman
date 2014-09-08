package com.ninjamind.confman.repository;

import org.hibernate.proxy.HibernateProxy;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class HibernateUtil {
    /**
     * Prend un objet qui peut �tre un proxy hibernate, l'initialise si n�cessaire, et retourne
     * l'instance d'objet � laquelle d�l�gue le proxy. Si l'objet pass� n'est pas un proxy,
     * l'objet lui-m�me est cast� et retourn�. <br/>
     * Cette m�thode est utile lorsqu'une entit� (exemple : LigneDExpedition) contient une instance
     * d'objet dont il existe plusieurs sous-classes (exemple : AbstractLigneDEnvoi), et qu'il faut
     * conna�tre et pouvoir utiliser le type concret de l'objet, tout en conservant le lazy-loading
     * via proxy, plus performant que le lazy-loading sans proxy.<br/>
     * Consulter le chapitre sur l'h�ritage du document ARCHIL_Normes_Oracle_Hibernate-XX.doc pour
     * plus de d�tails.<br/>
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
     * @param objetADeproxifier l'objet � d�proxifier
     * @param classeDeBaseDeLObjet la classe de base de l'objet, vers laquelle le r�sultat de la
     * d�proxification est cast� (exemple : AbstractLigneDEnvoi)
     * @return l'objet d�proxifi�
     * @throws ClassCastException dans le cas o� l'objet d�proxifi� n'est pas une instance de la
     * classe donn�e
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
