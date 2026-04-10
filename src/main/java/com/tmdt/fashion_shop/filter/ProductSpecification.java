package com.tmdt.fashion_shop.filter;

import com.tmdt.fashion_shop.entity.Product;
import com.tmdt.fashion_shop.enums.ProductSize;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;

public class ProductSpecification {

    public static Specification<Product> filter(
            Double minPrice,
            Double maxPrice,
            ProductSize size,
            String color
    ) {
        return (root, query, cb) -> {

            // tránh duplicate khi join
//            root.fetch("variants", JoinType.LEFT);
            Join<Object, Object> variantJoin = (Join<Object, Object>) root.fetch("variants", JoinType.LEFT);
            query.distinct(true);

//            Join<Object, Object> variantJoin = root.join("variants");

            var predicates = cb.conjunction();

            // price
            if (minPrice != null) {
                predicates = cb.and(predicates,
                        cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates = cb.and(predicates,
                        cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // size
            if (size != null) {
                predicates = cb.and(predicates,
                        cb.equal(variantJoin.get("size"), size));
            }

            // color
            if (color != null && !color.isEmpty()) {
                predicates = cb.and(predicates,
                        cb.like(cb.lower(variantJoin.get("color")),
                                "%" + color.toLowerCase() + "%"));
            }

            return predicates;
        };
    }
}