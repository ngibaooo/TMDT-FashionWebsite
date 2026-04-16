package com.tmdt.fashion_shop.service.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    String uploadFile(MultipartFile file);
}