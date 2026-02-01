import { Bubble } from "@/types-schemas";

export const checkCollision = (bubble1: Bubble, bubble2: Bubble) => {
  const dx = bubble1.x - bubble2.x;
  const dy = bubble1.y - bubble2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < bubble1.r + bubble2.r;
};

// Handle collision response
export const handleCollisionBetweenSiblings = (
  bubble1: Bubble,
  bubble2: Bubble,
) => {
  const dx = bubble2.x - bubble1.x;
  const dy = bubble2.y - bubble1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return;

  // Normalize collision vector
  const nx = dx / distance;
  const ny = dy / distance;

  // Relative velocity
  const dvx = bubble2.vx - bubble1.vx;
  const dvy = bubble2.vy - bubble1.vy;

  // Relative velocity along collision normal
  const dvn = dvx * nx + dvy * ny;

  if (dvn > 0) return;

  // Collision impulse
  const impulse = dvn;

  // Update velocities
  bubble1.vx += impulse * nx;
  bubble1.vy += impulse * ny;
  bubble2.vx -= impulse * nx;
  bubble2.vy -= impulse * ny;

  // Separate overlapping bubbles
  const overlap = bubble1.r + bubble2.r - distance;
  if (overlap > 0) {
    const separationX = (overlap / 2) * nx;
    const separationY = (overlap / 2) * ny;

    bubble1.x -= separationX;
    bubble1.y -= separationY;
    bubble2.x += separationX;
    bubble2.y += separationY;
  }
};

export const handleCollisionBetweenNodeAndLeaf = (
  node: Bubble,
  leaf: Bubble,
) => {
  const dx = leaf.x - node.x;
  const dy = leaf.y - node.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return;

  // Normalize direction vector (from node center to leaf)
  const nx = dx / distance;
  const ny = dy / distance;

  // Maximum allowed distance (leaf must stay inside node)
  const maxDistance = node.r - leaf.r;

  if (distance > maxDistance) {
    // Push leaf back inside the boundary
    leaf.x = node.x + nx * maxDistance;
    leaf.y = node.y + ny * maxDistance;

    // Calculate velocity component pointing outward
    const outwardVelocity = leaf.vx * nx + leaf.vy * ny;

    if (outwardVelocity > 0) {
      // Reflect outward velocity to "bounce" back inside
      leaf.vx -= 2 * outwardVelocity * nx;
      leaf.vy -= 2 * outwardVelocity * ny;
    }
  }
};
