package com.tmdt.fashion_shop.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private static final String UPLOAD_DIR = "uploads/";

    @Override
    public String uploadFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/";

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs(); // 👈 tạo folder nếu chưa có
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            File destination = new File(uploadDir + fileName);

            file.transferTo(destination);

            return fileName;

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Upload file thất bại: " + e.getMessage());
        }
    }
}
