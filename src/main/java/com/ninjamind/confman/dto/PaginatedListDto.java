package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.PaginatedList;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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
public class PaginatedListDto<T> implements Serializable {
    /**
     * The paginated list is partial but we need the complete size to calculate to calculate the next pages
     */
    private int completeSize;
    /**
     * Number of the current page
     */
    private int currentPage;
    /**
     * The page are determinated with the nb element by page. The default value is 25
     */
    private int nbElementByPage;
    /**
     * List
     */
    private List<T> list;

    public PaginatedListDto(int completeSize, int currentPage, int nbElementByPage, List<T> list) {
        this.completeSize = completeSize;
        this.currentPage = currentPage;
        this.nbElementByPage = nbElementByPage;
        this.list = list;
    }
}
