package com.wexa.backend.dto;

import java.util.List;

public record ArtistDetailsDTO(
        String name,
        String artistId,
        Integer popularity,
        List<String> genres,
        List<String> Songs
) {}
