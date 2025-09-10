import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';



@Component({
  selector: 'app-background',
  template: '<div id="bg-container"></div>',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit, OnDestroy {
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initThree();
    }
  }

  private initThree() {
    const container = document.getElementById('bg-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff99, wireframe: true });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    camera.position.z = 50;

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      this.renderer.render(scene, camera);
    };

    animate();
  }

 ngOnDestroy(): void {
  if (this.isBrowser && this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(this.animationFrameId);
  }
  if (this.isBrowser && this.renderer) {
    this.renderer.dispose();
  }
}

}
