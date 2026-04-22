package com.tmdt.fashion_shop.service.category;

import com.tmdt.fashion_shop.dto.category.*;
import com.tmdt.fashion_shop.entity.Category;
import com.tmdt.fashion_shop.enums.CategoryStatus;
import com.tmdt.fashion_shop.enums.ProductStatus;
import com.tmdt.fashion_shop.repository.CategoryRepository;
import com.tmdt.fashion_shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService{
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDTO(
                        c.getId(),
                        c.getName(),
                        c.getParentCategory() != null ? c.getParentCategory().getId() : null,
                        c.getParentCategory() != null ? c.getParentCategory().getName() : null,
                        c.getStatus()
                ))
                .toList();
    }
    @Override
    public CategoryDetailDTO getDetail(String id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

        // children
        List<CategoryChildDTO> children = categoryRepository
                .findByParentCategory_Id(id)
                .stream()
                .map(c -> new CategoryChildDTO(c.getId(), c.getName()))
                .toList();

        // count product
        long totalProducts = productRepository.countByCategory_Id(id);

        return new CategoryDetailDTO(
                category.getId(),
                category.getName(),
                category.getParentCategory() != null ? category.getParentCategory().getId() : null,
                category.getParentCategory() != null ? category.getParentCategory().getName() : null,
                children,
                totalProducts
        );
    }
    @Override
    public void createCategory(CreateCategoryRequestDTO request) {

        // ===== VALIDATE =====
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên category không được để trống");
        }

        String name = request.getName().trim();

        // check trùng name
        if (categoryRepository.existsByNameIgnoreCaseAndParentCategory_Id(name, request.getParentId())) {
            throw new RuntimeException("Category đã tồn tại");
        }

        Category category = new Category();
        category.setId(UUID.randomUUID().toString());
        category.setName(name);

        // ===== PARENT =====
        if (request.getParentId() != null && !request.getParentId().isBlank()) {

            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category không tồn tại"));

            category.setParentCategory(parent);
        }
        category.setStatus(CategoryStatus.ACTIVE);

        categoryRepository.save(category);
    }
//    Check vòng lặp (tránh update category cha của nó là chính nó)
    private boolean isCycle(Category current, Category newParent) {

        Category temp = newParent;

        while (temp != null) {
            if (temp.getId().equals(current.getId())) {
                return true; // phát hiện vòng lặp
            }
            temp = temp.getParentCategory();
        }

        return false;
    }
    @Override
    public void updateCategory(String id, UpdateCategoryRequestDTO request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

        // UPDATE NAME
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            category.setName(request.getName().trim());
        }

        //  UPDATE PARENT
        if (request.getParentId() != null) {

            // muốn xóa parent
            if (request.getParentId().isBlank()) {
                category.setParentCategory(null);
            } else {
                Category parent = categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent category không tồn tại"));

                // không cho set chính nó làm cha
                if (parent.getId().equals(id)) {
                    throw new RuntimeException("Không thể set chính nó làm parent");
                }

                // tránh vòng lặp (optional nâng cao)
                if (isCycle(parent, category)) {
                    throw new RuntimeException("Không thể tạo vòng lặp category");
                }

                category.setParentCategory(parent);
            }
        }

        categoryRepository.save(category);
    }
    @Override
    public void deleteCategory(String id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

        // ===== VALIDATE =====
        if (category.getStatus() == CategoryStatus.INACTIVE) {
            throw new RuntimeException("Category đã bị vô hiệu hóa trước đó");
        }

        // check có category con
        boolean hasChildren = categoryRepository.existsByParentCategory_Id(id);
        if (hasChildren) {
            throw new RuntimeException("Không thể xóa category đang có danh mục con");
        }

        // ===== CHECK PRODUCT ACTIVE =====
        boolean hasActiveProduct =
                productRepository.existsByCategory_IdAndStatus(id, ProductStatus.ACTIVE);

        if (hasActiveProduct) {
            throw new RuntimeException("Không thể xóa category đang chứa sản phẩm đang bán");
        }

        // chặn luôn OUT_OF_STOCK

        boolean hasOutOfStock =
                productRepository.existsByCategory_IdAndStatus(id, ProductStatus.OUT_OF_STOCK);

        if (hasOutOfStock) {
            throw new RuntimeException("Category vẫn còn sản phẩm hết hàng");
        }


        // ===== SOFT DELETE =====
        category.setStatus(CategoryStatus.INACTIVE);

        categoryRepository.save(category);
    }
    @Override
    public void enableCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

        if (category.getStatus() == CategoryStatus.ACTIVE) {
            throw new RuntimeException("Category đang hoạt động");
        }

        category.setStatus(CategoryStatus.ACTIVE);
        categoryRepository.save(category);
    }
}
