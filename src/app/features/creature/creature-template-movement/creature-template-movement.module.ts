import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureTemplateMovementComponent } from './creature-template-movement.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

@NgModule({
  declarations: [CreatureTemplateMovementComponent],
  imports: [BrowserModule, ReactiveFormsModule, TopBarModule, QueryOutputModule, TooltipModule, ToastrModule, SingleValueSelectorModule],
  exports: [CreatureTemplateMovementComponent],
  providers: [CreatureTemplateMovementService],
})
export class CreatureTemplateMovementModule {}
