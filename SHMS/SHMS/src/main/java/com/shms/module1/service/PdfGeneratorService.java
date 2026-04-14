package com.shms.module1.service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.shms.module1.entity.Hall;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;

@Service
public class PdfGeneratorService {

    public byte[] generateAllotmentLetter(Student student, Room room, Hall hall) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            
            document.open();
            document.add(new Paragraph("STUDENT HOSTEL MANAGEMENT SYSTEM"));
            document.add(new Paragraph("======================================"));
            document.add(new Paragraph("ROOM ALLOTMENT LETTER"));
            document.add(new Paragraph("Date: " + LocalDateTime.now()));
            document.add(new Paragraph("--------------------------------------"));
            document.add(new Paragraph("Dear " + student.getStudentName() + ","));
            document.add(new Paragraph(""));
            document.add(new Paragraph("You have been successfully registered and allotted a room. Below are the details:"));
            document.add(new Paragraph(""));
            document.add(new Paragraph("Student ID: " + student.getId()));
            document.add(new Paragraph("Hall Name: " + hall.getName() + " (" + hall.getHallType().name() + ")"));
            document.add(new Paragraph("Room Number: " + room.getRoomNumber() + " (" + room.getRoomType().name() + " seater)"));
            document.add(new Paragraph("Calculated Base Rent: ₹" + room.getRentAmount() + " / month"));
            document.add(new Paragraph("Hall Amenity Charge: ₹" + hall.getAmenityCharge() + " / month"));
            document.add(new Paragraph(""));
            document.add(new Paragraph("Status: " + student.getDuesStatus()));
            document.add(new Paragraph("--------------------------------------"));
            document.add(new Paragraph("Please maintain this document for your records."));
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF allotment letter", e);
        }
    }
}
