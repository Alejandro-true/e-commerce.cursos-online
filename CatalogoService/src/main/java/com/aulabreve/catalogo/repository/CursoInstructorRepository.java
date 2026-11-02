package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.CursoInstructor;
import com.aulabreve.catalogo.model.CursoInstructorId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CursoInstructorRepository
        extends JpaRepository<CursoInstructor, CursoInstructorId> {
    List<CursoInstructor> findByCurso_Id(UUID cursoId);
    List<CursoInstructor> findById_InstructorId(String instructorId);
}
