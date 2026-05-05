package com.tmdt.fashion_shop.service.gmail;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mã OTP xác thực EAZY VIBES");
        message.setText("Mã OTP của bạn là: " + otp + "\nHết hạn sau 5 phút.");

        mailSender.send(message);
    }
}