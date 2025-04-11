/**
 * Process raw data into matrix format for chord diagram.
 * 
 * @param {Array} rawData The actor-director collaboration data
 * @param {number} maxEntities Maximum number of entities to include
 * @param {Object} collabs The collabs object containing actor-director and actor-actor collaborations
 * @returns {Object} Processed data object with matrix, entities and types
 */
export function processData(rawData, maxEntities, collabs) {
  // First get all actors from actorDirectorData
  const actorsFromDirectorData = [...new Set(rawData.map(c => c.participant1 === "writer/director" ? c.participant2 : c.participant1))];
  
  // Get all actor-actor collaborations from collabs
  const actorActorCollabs = collabs.filter(c => 
    c.connectionType === "actor/actor" && 
    actorsFromDirectorData.includes(c.participant1) && 
    actorsFromDirectorData.includes(c.participant2)
  );
  
  // Get all directors from actorDirectorData
  const directors = [...new Set(rawData.map(c => c.participant1 === "writer/director" ? c.participant1 : c.participant2))];

  // Calculate counts for actors and directors
  const actorCounts = {}, directorCounts = {};
  rawData.forEach(c => {
    const actor = c.participant1 === "writer/director" ? c.participant2 : c.participant1;
    const director = c.participant1 === "writer/director" ? c.participant1 : c.participant2;
    actorCounts[actor] = (actorCounts[actor] || 0) + c.count;
    directorCounts[director] = (directorCounts[director] || 0) + c.count;
  });

  // Get top actors and directors
  const topActors = actorsFromDirectorData
    .sort((a, b) => actorCounts[b] - actorCounts[a])
    .slice(0, Math.ceil(maxEntities / 2));
  
  const topDirectors = directors
    .sort((a, b) => directorCounts[b] - directorCounts[a])
    .slice(0, Math.floor(maxEntities / 2));
    
  const allEntities = [...topActors, ...topDirectors];
  const allTypes = [...topActors.map(() => 'actor'), ...topDirectors.map(() => 'director')];

  // Create initial matrix with all potential entities
  const initialMatrix = Array.from({ length: allEntities.length }, () => Array(allEntities.length).fill(0));
  
  // Add actor-director connections from actorDirectorData
  rawData.forEach(c => {
    const actor = c.participant1 === "writer/director" ? c.participant2 : c.participant1;
    const director = c.participant1 === "writer/director" ? c.participant1 : c.participant2;
    
    const aIdx = allEntities.indexOf(actor);
    const dIdx = allEntities.indexOf(director);
    
    if (aIdx !== -1 && dIdx !== -1) {
      initialMatrix[aIdx][dIdx] = c.count;
      initialMatrix[dIdx][aIdx] = c.count;
    }
  });
  
  // Add actor-actor connections from actorActorCollabs
  actorActorCollabs.forEach(c => {
    const a1Idx = allEntities.indexOf(c.participant1);
    const a2Idx = allEntities.indexOf(c.participant2);
    
    if (a1Idx !== -1 && a2Idx !== -1) {
      initialMatrix[a1Idx][a2Idx] = c.count;
      initialMatrix[a2Idx][a1Idx] = c.count;
    }
  });

  // Now filter out entities that have no connections
  const connectedIndices = new Set();
  
  // Find all indices that have at least one connection
  for (let i = 0; i < initialMatrix.length; i++) {
    for (let j = 0; j < initialMatrix[i].length; j++) {
      if (initialMatrix[i][j] > 0) {
        connectedIndices.add(i);
        connectedIndices.add(j);
      }
    }
  }

  // If no entities have connections, return empty data
  if (connectedIndices.size === 0) {
    return { matrix: [], entities: [], types: [] };
  }

  // Create new arrays with only connected entities
  const connectedEntities = [];
  const connectedTypes = [];
  const indexMap = {}; // Maps old indices to new indices
  
  Array.from(connectedIndices).sort((a, b) => a - b).forEach((oldIndex, newIndex) => {
    connectedEntities.push(allEntities[oldIndex]);
    connectedTypes.push(allTypes[oldIndex]);
    indexMap[oldIndex] = newIndex;
  });

  // Create new matrix with only connected entities
  const matrix = Array.from({ length: connectedEntities.length }, () => Array(connectedEntities.length).fill(0));
  
  // Populate the new matrix with connections
  for (let i = 0; i < initialMatrix.length; i++) {
    if (indexMap[i] === undefined) continue;
    for (let j = 0; j < initialMatrix[i].length; j++) {
      if (indexMap[j] === undefined) continue;
      if (initialMatrix[i][j] > 0) {
        matrix[indexMap[i]][indexMap[j]] = initialMatrix[i][j];
        matrix[indexMap[j]][indexMap[i]] = initialMatrix[i][j];
      }
    }
  }

  return { matrix, entities: connectedEntities, types: connectedTypes };
}

/**
 * Filter data to focus on a specific entity.
 * 
 * @param {string} entityName The name of the entity to focus on
 * @param {string} entityType The type of the entity ('actor' or 'director')
 * @param {Object} collabs The collaboration data
 * @returns {Object} Filtered data focused on the specified entity
 */
export function filterDataByEntity(entityName, entityType, collabs) {
  // Create result structure
  const result = {
    actorDirectorCollabs: [],
    actorActorCollabs: []
  };
  
  // First determine if we're looking for an actor or director
  const connectionType = entityType === 'actor' ? 'actor/director' : 'writer/director';
  
  if (entityType === 'actor') {
    // Find all collaborations where this actor appears
    // 1. Actor-Director collaborations where this actor worked with directors
    result.actorDirectorCollabs = collabs.filter(c => 
      (c.connectionType === 'actor/director' || c.connectionType === 'writer/director') && 
      (c.participant1 === entityName || c.participant2 === entityName)
    );
    
    // Get list of all connected directors
    const connectedDirectors = [...new Set(
      result.actorDirectorCollabs
        .filter(c => c.participant1 === entityName ? c.participant2 : c.participant1)
        .map(c => c.participant1 === entityName ? c.participant2 : c.participant1)
    )];
    
    // 2. Actor-Actor collaborations where this actor worked with other actors
    result.actorActorCollabs = collabs.filter(c => 
      c.connectionType === 'actor/actor' && 
      (c.participant1 === entityName || c.participant2 === entityName)
    );
    
    // Get list of all connected actors
    const connectedActors = [...new Set(
      result.actorActorCollabs.map(c => c.participant1 === entityName ? c.participant2 : c.participant1)
    )];
    
    // 3. Add all additional actor-director collaborations for any connected actors or directors
    // This shows complete network of connections for this entity
    const additionalActorDirectorCollabs = collabs.filter(c => 
      (c.connectionType === 'actor/director' || c.connectionType === 'writer/director') &&
      ((connectedActors.includes(c.participant1) || connectedActors.includes(c.participant2)) ||
       (connectedDirectors.includes(c.participant1) || connectedDirectors.includes(c.participant2))) &&
      c.participant1 !== entityName && c.participant2 !== entityName
    );
    
    // Add these additional connections to our results
    result.actorDirectorCollabs = [...result.actorDirectorCollabs, ...additionalActorDirectorCollabs];
    
    return result;
  } else if (entityType === 'director') {
    // Find all collaborations where this director appears
    // 1. Actor-Director collaborations where this director worked with actors
    result.actorDirectorCollabs = collabs.filter(c => 
      (c.connectionType === 'actor/director' || c.connectionType === 'writer/director') && 
      (c.participant1 === entityName || c.participant2 === entityName)
    );
    
    // Get list of all connected actors
    const connectedActors = [...new Set(
      result.actorDirectorCollabs.map(c => c.participant1 === entityName ? c.participant2 : c.participant1)
    )];
    
    // 2. Actor-Actor collaborations among actors who worked with this director
    result.actorActorCollabs = collabs.filter(c => 
      c.connectionType === 'actor/actor' && 
      connectedActors.includes(c.participant1) && connectedActors.includes(c.participant2)
    );
    
    // 3. Add all additional actor-director collaborations for any connected actors
    // This shows the complete network around this director
    const additionalActorDirectorCollabs = collabs.filter(c => 
      (c.connectionType === 'actor/director' || c.connectionType === 'writer/director') &&
      (connectedActors.includes(c.participant1) || connectedActors.includes(c.participant2)) &&
      c.participant1 !== entityName && c.participant2 !== entityName
    );
    
    // Add these additional connections to our results
    result.actorDirectorCollabs = [...result.actorDirectorCollabs, ...additionalActorDirectorCollabs];
    
    return result;
  }
  
  // Fallback - return original collabs wrapped in our result structure
  return {
    actorDirectorCollabs: collabs.filter(c => c.connectionType === 'actor/director' || c.connectionType === 'writer/director'),
    actorActorCollabs: collabs.filter(c => c.connectionType === 'actor/actor')
  };
}

/**
 * Get all unique entities for autocomplete.
 * 
 * @param {Object} collabs Collaboration data
 * @returns {Array} Array of entities with name and type
 */
export function getEntitiesForAutocomplete(collabs) {
  // Get unique actors from actor-director collaborations
  const actors = [...new Set(collabs.actorDirectorCollabs.map(c => c.actor))];
  
  // Get unique directors from actor-director collaborations
  const directors = [...new Set(collabs.actorDirectorCollabs.map(c => c.director))];
  
  // Combine into a single array with type info
  return [
    ...actors.map(name => ({ name, type: 'actor' })),
    ...directors.map(name => ({ name, type: 'director' }))
  ];
}

/**
 * Filter entities for autocomplete based on search term.
 * 
 * @param {Array} entities Array of entities with name and type
 * @param {string} searchTerm The search term to filter by
 * @param {number} maxResults Maximum number of results to return
 * @returns {Array} Filtered entities matching the search term
 */
export function filterEntitiesForAutocomplete(entities, searchTerm, maxResults) {
  // Convert search term to lowercase for case-insensitive matching
  const search = searchTerm.toLowerCase();
  
  // Filter entities that include the search term
  const filtered = entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  );
  
  // Limit results and return
  return filtered.slice(0, maxResults);
}

export function handleEntitySelect(entityName, entityType, collabs, maxEntSelect, renderChordDiagram, currentData, highlightEntity, searchInput, dropdown) {
  const filteredRawData = filterDataByEntity(entityName, entityType, collabs);
  const newData = processData(filteredRawData.actorDirectorCollabs, maxEntSelect.value, collabs);
  
  renderChordDiagram(newData);
  
  currentData = newData;
  
  const idx = newData.entities.findIndex(name => name === entityName);
  highlightEntity = idx !== -1 ? idx : null;
  
  searchInput.value = entityName;
  
  dropdown.style("display", "none");
};
