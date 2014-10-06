package com.ninjamind.confman.domain;

import java.util.ArrayList;
import java.util.Collection;

/**
 * List supporting paginated result sets. A paginated list
 * <ul>
 *     <li>is a partial list so it inherite from ArrayList</li>
 *     <li>has several elements like
 *     <ul>
 *        <li>size of the completeList</li>
 *        <li>number of the current page</li>
 *        <li>number of elements by page</li>
 *     </ul>
 *     </li>
 *
 * </ul>
 */
public class PaginatedList<T> extends ArrayList<T> {
    public static int NB_MAX = 99999;
    public static int NB_DEFAULT = 25;
    /**
     * The paginated list is partial but we need the complete size to calculate to calculate the next pages
     */
    private int completeSize = 0;
    /**
     * Number of the current page
     */
    private int currentPage = 1;
    /**
     * The page are determinated with the nb element by page. The default value is 25
     */
    private int nbElementByPage = NB_DEFAULT;

    /**
     * Constructs an empty list with an initial capacity
     */
    public PaginatedList() {
        super();
    }

    /**
     * Constructs a list containing the elements of the specified
     * collection, in the order they are returned by the collection's
     * iterator.
     *
     * @param c the collection whose elements are to be placed into this list
     * @throws NullPointerException if the specified collection is null
     */
    public PaginatedList(Collection<? extends T> c) {
        super(c);
    }

    public int getCompleteSize() {
        return completeSize;
    }

    public PaginatedList setCompleteSize(int completeSize) {
        this.completeSize = completeSize;
        return this;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public PaginatedList setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
        return this;
    }

    public int getNbElementByPage() {
        return nbElementByPage;
    }

    public PaginatedList setNbElementByPage(int nbElementByPage) {
        this.nbElementByPage = nbElementByPage;
        return this;
    }


}
